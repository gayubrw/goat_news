'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
    PlusCircle,
    Search,
    ChevronRight,
    MoreVertical,
    Pencil,
    Trash2,
    Plus,
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Category, SubCategory } from '@/types';
import {
    getCategories,
    createCategory,
    createSubCategory,
    updateCategory,
    updateSubCategory,
    deleteCategory,
    deleteSubCategory,
} from '@/actions/category';

// Utility function for form fields
const FormField = ({
    label,
    id,
    maxLength,
    isTextarea = false,
    value,
    onChange,
    error,
}: {
    label: string;
    id: string;
    maxLength: number;
    isTextarea?: boolean;
    value: string;
    onChange: (value: string) => void;
    error?: string;
}) => (
    <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor={id} className="text-right text-muted-foreground">
            {label}
        </Label>
        <div className="col-span-3">
            {isTextarea ? (
                <Textarea
                    id={id}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    maxLength={maxLength}
                    className="bg-muted border-input text-foreground placeholder:text-muted-foreground"
                    placeholder={`Enter ${label.toLowerCase()}`}
                />
            ) : (
                <Input
                    id={id}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    maxLength={maxLength}
                    className="bg-muted border-input text-foreground placeholder:text-muted-foreground"
                    placeholder={`Enter ${label.toLowerCase()}`}
                />
            )}
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        </div>
    </div>
);

type CategoryInput = {
    title: string;
    description: string;
};

type SubCategoryInput = CategoryInput & {
    categoryId: string;
};

const Page = () => {
    const { toast } = useToast();
    const [categories, setCategories] = React.useState<Category[]>([]);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [selectedItem, setSelectedItem] = React.useState<{
        item: Category | SubCategory | null;
        isSubCategory: boolean;
    }>({ item: null, isSubCategory: false });
    const [selectedParentCategory, setSelectedParentCategory] = React.useState<Category | null>(null);
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);

    const columns = [
        'Category Name',
        'Path',
        'Description',
        'Created Date',
        'Actions',
    ];

    // Updated handlers with proper types
    const handleCreateCategory = async (data: CategoryInput) => {
        const newCategory = await createCategory(data);
        setCategories(prev => [...prev, newCategory]);
        return newCategory;
    };

    const handleCreateSubCategory = async (data: SubCategoryInput) => {
        const newSubCategory = await createSubCategory(data);
        setCategories(prev =>
            prev.map(category =>
                category.id === data.categoryId
                    ? {
                        ...category,
                        subCategories: [...category.subCategories, newSubCategory]
                    }
                    : category
            )
        );
        return newSubCategory;
    };

    const handleUpdateCategory = async (id: string, data: CategoryInput) => {
        const updatedCategory = await updateCategory(id, data);
        setCategories(prev =>
            prev.map(category =>
                category.id === id ? updatedCategory : category
            )
        );
        return updatedCategory;
    };

    const handleUpdateSubCategory = async (id: string, data: SubCategoryInput) => {
        const updatedSubCategory = await updateSubCategory(id, data);
        setCategories(prev =>
            prev.map(category => ({
                ...category,
                subCategories: category.subCategories.map(sub =>
                    sub.id === id ? updatedSubCategory : sub
                )
            }))
        );
        return updatedSubCategory;
    };

    const handleDeleteCategory = async (id: string) => {
        await deleteCategory(id);
        setCategories(prev => prev.filter(category => category.id !== id));
    };

    const handleDeleteSubCategory = async (id: string) => {
        await deleteSubCategory(id);
        setCategories(prev =>
            prev.map(category => ({
                ...category,
                subCategories: category.subCategories.filter(sub => sub.id !== id)
            }))
        );
    };

    // Fetch categories on mount
    React.useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await getCategories();
                setCategories(data);
            } catch (error) {
                if (error instanceof Error) {
                    toast({
                        title: 'Error fetching categories',
                        description: error.message,
                        variant: 'destructive',
                    });
                }
            }
        };

        fetchCategories();
    }, [toast]);

    // Filter categories based on search term
    const filteredCategories = categories.filter(
        (category) =>
            category.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            category.description
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            category.subCategories.some(
                (sub) =>
                    sub.title
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    sub.description
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase())
            )
    );

    const handleEdit = (
        item: Category | SubCategory,
        isSubCategory: boolean
    ) => {
        setSelectedItem({ item, isSubCategory });
        if (isSubCategory) {
            const parentCategory = categories.find((cat) =>
                cat.subCategories.some((sub) => sub.id === item.id)
            );
            setSelectedParentCategory(parentCategory || null);
        }
        setIsDialogOpen(true);
    };

    const handleAddSub = (category: Category) => {
        setSelectedParentCategory(category);
        setSelectedItem({ item: null, isSubCategory: true });
        setIsDialogOpen(true);
    };

    const handleAddCategory = () => {
        setSelectedItem({ item: null, isSubCategory: false });
        setSelectedParentCategory(null);
        setIsDialogOpen(true);
    };

    // CategoryDialog Component
    const CategoryDialog = ({
        isSubCategory = false,
        parentCategoryId = '',
        onClose,
        editData = null,
    }: {
        isSubCategory?: boolean;
        parentCategoryId?: string;
        onClose: () => void;
        editData?: Category | SubCategory | null;
    }) => {
        const { toast } = useToast();
        const [formData, setFormData] = React.useState<CategoryInput>({
            title: editData?.title || '',
            description: editData?.description || '',
        });
        const [errors, setErrors] = React.useState<Record<string, string>>({});

        const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            setErrors({});

            try {
                if (editData) {
                    if (isSubCategory) {
                        await handleUpdateSubCategory(editData.id, {
                            ...formData,
                            categoryId: parentCategoryId,
                        });
                    } else {
                        await handleUpdateCategory(editData.id, formData);
                    }
                    toast({ title: 'Updated successfully' });
                } else {
                    if (isSubCategory) {
                        await handleCreateSubCategory({
                            ...formData,
                            categoryId: parentCategoryId,
                        });
                    } else {
                        await handleCreateCategory(formData);
                    }
                    toast({ title: 'Created successfully' });
                }
                onClose();
            } catch (error) {
                if (error instanceof Error) {
                    toast({
                        title: 'Error',
                        description: error.message,
                        variant: 'destructive',
                    });
                }
            }
        };

        return (
            <DialogContent className="sm:max-w-[425px] border-border bg-background">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle className="text-foreground">
                            {editData ? 'Edit' : 'Add New'}{' '}
                            {isSubCategory ? 'Sub' : ''} Category
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                            {editData ? 'Edit' : 'Create a new'}{' '}
                            {isSubCategory ? 'sub' : ''} category
                            {isSubCategory ? ' to the selected category' : ''}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <FormField
                            label="Name"
                            id="title"
                            maxLength={100}
                            value={formData.title}
                            onChange={(value) =>
                                setFormData((prev) => ({ ...prev, title: value }))
                            }
                            error={errors.title}
                        />
                        <FormField
                            label="Description"
                            id="description"
                            maxLength={200}
                            value={formData.description}
                            onChange={(value) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    description: value,
                                }))
                            }
                            error={errors.description}
                            isTextarea
                        />
                    </div>
                    <DialogFooter>
                        <Button type="submit" variant="secondary">
                            {editData ? 'Update' : 'Save'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        );
    };

    // ActionsMenu Component
    const ActionsMenu = ({
        item,
        isSubCategory = false,
        onEdit,
        onAddSub,
    }: {
        item: Category | SubCategory;
        isSubCategory?: boolean;
        onEdit: () => void;
        onAddSub?: () => void;
    }) => {
        const { toast } = useToast();

        const handleDelete = async () => {
            try {
                if (isSubCategory) {
                    await handleDeleteSubCategory(item.id);
                } else {
                    await handleDeleteCategory(item.id);
                }
                toast({ title: 'Deleted successfully' });
            } catch (error) {
                if (error instanceof Error) {
                    toast({
                        title: 'Error',
                        description: error.message,
                        variant: 'destructive',
                    });
                }
            }
        };

        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        className="h-8 w-8 p-0 text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    align="end"
                    className="border-border bg-background"
                >
                    {!isSubCategory && onAddSub && (
                        <DropdownMenuItem
                            className="flex items-center gap-2 hover:bg-muted"
                            onSelect={(e) => {
                                e.preventDefault();
                                onAddSub();
                            }}
                        >
                            <Plus className="h-4 w-4" />
                            Add Sub Category
                        </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                        className="flex items-center gap-2 hover:bg-muted"
                        onSelect={onEdit}
                    >
                        <Pencil className="h-4 w-4" />
                        Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        className="flex items-center gap-2 text-destructive hover:bg-muted hover:text-destructive"
                        onSelect={handleDelete}
                    >
                        <Trash2 className="h-4 w-4" />
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        );
    };

    // TableContent Component
    const TableContent = ({
        columns,
        categories,
        onEdit,
        onAddSub,
    }: {
        columns: string[];
        categories: Category[];
        onEdit: (item: Category | SubCategory, isSubCategory: boolean) => void;
        onAddSub: (category: Category) => void;
    }) => {
        const [openCategories, setOpenCategories] = React.useState<string[]>([]);

        const toggleCategory = (categoryId: string) => {
            setOpenCategories((prev) =>
                prev.includes(categoryId)
                    ? prev.filter((id) => id !== categoryId)
                    : [...prev, categoryId]
            );
        };

        const formatDate = (date: string | Date): string => {
            const dateObject = date instanceof Date ? date : new Date(date);
            const dateFormat = new Intl.DateTimeFormat('en-US', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
            }).format(dateObject);

            const timeFormat = new Intl.DateTimeFormat('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
            }).format(dateObject);

            return `${dateFormat} - ${timeFormat}`;
        };

        return (
            <Table>
                <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="w-12"></TableHead>
                        {columns.map((column) => (
                            <TableHead
                                key={column}
                                className={`text-muted-foreground ${
                                    column === 'Actions'
                                        ? 'text-right'
                                        : 'text-left'
                                }`}
                            >
                                {column}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {categories.flatMap((category) => [
                        <TableRow
                            key={category.id}
                            className="border-border hover:bg-muted"
                        >
                            <TableCell className="w-12 p-0">
                                <Button
                                    variant="ghost"
                                    className="h-full w-full p-4"
                                    onClick={() => toggleCategory(category.id)}
                                >
                                    <ChevronRight
                                        className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                                            openCategories.includes(category.id)
                                                ? 'rotate-90'
                                                : ''
                                        }`}
                                    />
                                </Button>
                            </TableCell>
                            <TableCell className="font-medium text-foreground">
                                {category.title}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                                {category.path}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                                {category.description}
                            </TableCell>
                            <TableCell className="text-muted-foreground whitespace-nowrap">
                                {formatDate(category.createdAt)}
                            </TableCell>
                            <TableCell className="text-right">
                                <ActionsMenu
                                    item={category}
                                    onEdit={() => onEdit(category, false)}
                                    onAddSub={() => onAddSub(category)}
                                />
                            </TableCell>
                        </TableRow>,
                        ...category.subCategories.map((subCategory) => (
                            <TableRow
                                key={subCategory.id}
                                className={`border-border bg-muted/50 hover:bg-muted ${
                                    openCategories.includes(category.id)
                                        ? ''
                                        : 'hidden'
                                }`}
                            >
                                <TableCell className="w-12"></TableCell>
                                <TableCell className="pl-12 text-muted-foreground">
                                    {subCategory.title}
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    {subCategory.path}
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    {subCategory.description}
                                </TableCell>
                                <TableCell className="text-muted-foreground whitespace-nowrap">
                                    {formatDate(subCategory.createdAt)}
                                </TableCell>
                                <TableCell className="text-right">
                                    <ActionsMenu
                                        item={subCategory}
                                        isSubCategory
                                        onEdit={() => onEdit(subCategory, true)}
                                    />
                                </TableCell>
                            </TableRow>
                        )),
                    ])}
                </TableBody>
            </Table>
        );
    };

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-foreground">
                    Category Management
                </h1>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button
                            className="inline-flex items-center gap-2"
                            variant="secondary"
                            onClick={handleAddCategory}
                        >
                            <PlusCircle className="h-5 w-5" />
                            Add Category
                        </Button>
                    </DialogTrigger>
                    {isDialogOpen && (
                        <CategoryDialog
                            isSubCategory={selectedItem.isSubCategory}
                            parentCategoryId={selectedParentCategory?.id || ''}
                            editData={selectedItem.item}
                            onClose={() => {
                                setIsDialogOpen(false);
                                setSelectedItem({
                                    item: null,
                                    isSubCategory: false,
                                });
                                setSelectedParentCategory(null);
                            }}
                        />
                    )}
                </Dialog>
            </div>

            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search categories..."
                        className="pl-10 bg-muted border-input text-foreground placeholder:text-muted-foreground"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="rounded-lg border border-border bg-card shadow-lg overflow-hidden">
                <TableContent
                    columns={columns}
                    categories={filteredCategories}
                    onEdit={handleEdit}
                    onAddSub={handleAddSub}
                />
            </div>
        </div>
    );
};

export default Page;
