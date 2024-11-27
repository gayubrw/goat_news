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
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
    PlusCircle,
    Search,
    MoreVertical,
    Pencil,
    Trash2,
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Category, SubCategory } from '@/types';
import { getCategories } from '@/actions/category';
import {
    getSubCategories,
    createSubCategory,
    updateSubCategory,
    deleteSubCategory
} from '@/actions/subcategory';

// Types
type FormData = {
    title: string;
    description: string;
    categoryId: string;
};

// Form Component
const FormField = ({
    label,
    id,
    maxLength,
    value,
    onChange,
    isTextarea = false,
    error,
}: {
    label: string;
    id: string;
    maxLength: number;
    value: string;
    onChange: (value: string) => void;
    isTextarea?: boolean;
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
                    className="bg-muted border-input text-foreground"
                    placeholder={`Enter ${label.toLowerCase()}`}
                />
            ) : (
                <Input
                    id={id}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    maxLength={maxLength}
                    className="bg-muted border-input text-foreground"
                    placeholder={`Enter ${label.toLowerCase()}`}
                />
            )}
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        </div>
    </div>
);

// Dialog Component
const SubCategoryDialog = ({
    onClose,
    editData = null,
    categories,
    onSuccess,
}: {
    onClose: () => void;
    editData?: SubCategory | null;
    categories: Category[];
    onSuccess: () => void;
}) => {
    const { toast } = useToast();
    const [formData, setFormData] = React.useState<FormData>({
        title: editData?.title || '',
        description: editData?.description || '',
        categoryId: editData?.categoryId || categories[0]?.id || '',
    });
    const [errors, setErrors] = React.useState<Record<string, string>>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        try {
            if (editData) {
                await updateSubCategory(editData.id, formData);
                toast({ title: 'Sub category updated successfully' });
            } else {
                await createSubCategory(formData);
                toast({ title: 'Sub category created successfully' });
            }
            onSuccess();
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
                        {editData ? 'Edit' : 'Add New'} Sub Category
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        {editData ? 'Edit the' : 'Create a new'} subcategory.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="categoryId" className="text-right text-muted-foreground">
                            Category
                        </Label>
                        <Select
                            value={formData.categoryId}
                            onValueChange={(value) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    categoryId: value,
                                }))
                            }
                        >
                            <SelectTrigger className="col-span-3 bg-muted border-input text-foreground">
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent className="bg-background border-border">
                                {categories.map((category) => (
                                    <SelectItem
                                        key={category.id}
                                        value={category.id}
                                    >
                                        {category.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
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

// Actions Menu Component
const ActionsMenu = ({
    subcategory,
    onEdit,
    onDelete,
}: {
    subcategory: SubCategory;
    onEdit: (subcategory: SubCategory) => void;
    onDelete: (id: string) => Promise<void>;
}) => (
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
            <DropdownMenuItem
                className="flex items-center gap-2 hover:bg-muted"
                onSelect={() => onEdit(subcategory)}
            >
                <Pencil className="h-4 w-4" />
                Edit
            </DropdownMenuItem>
            <DropdownMenuItem
                className="flex items-center gap-2 text-destructive hover:bg-muted hover:text-destructive"
                onSelect={() => onDelete(subcategory.id)}
            >
                <Trash2 className="h-4 w-4" />
                Delete
            </DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
);

// Main Page Component
const SubCategoriesPage = () => {
    const { toast } = useToast();
    const [categories, setCategories] = React.useState<Category[]>([]);
    const [subCategories, setSubCategories] = React.useState<SubCategory[]>([]);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [selectedCategory, setSelectedCategory] = React.useState<string>('all');
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const [selectedItem, setSelectedItem] = React.useState<SubCategory | null>(null);

    // Fetch data
    const fetchData = React.useCallback(async () => {
        try {
            const [categoriesData, subCategoriesData] = await Promise.all([
                getCategories(),
                getSubCategories()
            ]);
            setCategories(categoriesData);
            setSubCategories(subCategoriesData);
        } catch (error) {
            if (error instanceof Error) {
                toast({
                    title: 'Error fetching data',
                    description: error.message,
                    variant: 'destructive',
                });
            }
        }
    }, [toast]);

    React.useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Handlers
    const handleEdit = (subcategory: SubCategory) => {
        setSelectedItem(subcategory);
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteSubCategory(id);
            setSubCategories(prev => prev.filter(sub => sub.id !== id));
            toast({ title: 'Sub category deleted successfully' });
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

    const handleDialogClose = () => {
        setIsDialogOpen(false);
        setSelectedItem(null);
    };

    // Filter subcategories
    const filteredSubCategories = subCategories.filter(
        (sub) => {
            const matchesSearch =
                sub.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                sub.description.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory =
                selectedCategory === 'all' || sub.categoryId === selectedCategory;
            return matchesSearch && matchesCategory;
        }
    );

    // Format date helper
    const formatDate = (date: string | Date): string => {
        const dateObject = date instanceof Date ? date : new Date(date);
        const dateFormat = new Intl.DateTimeFormat('en-US', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
        }).format(dateObject);
        return dateFormat;
    };

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-foreground">
                    Sub Category Management
                </h1>
                <Dialog
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                >
                    <Button
                        onClick={() => setIsDialogOpen(true)}
                        className="inline-flex items-center gap-2"
                        variant="secondary"
                    >
                        <PlusCircle className="h-5 w-5" />
                        Add Sub Category
                    </Button>
                    {isDialogOpen && (
                        <SubCategoryDialog
                            onClose={handleDialogClose}
                            editData={selectedItem}
                            categories={categories}
                            onSuccess={fetchData}
                        />
                    )}
                </Dialog>
            </div>

            <div className="mb-6 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search sub categories..."
                        className="pl-10 bg-muted border-input text-foreground"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-4">
                    <Select
                        value={selectedCategory}
                        onValueChange={setSelectedCategory}
                    >
                        <SelectTrigger className="w-[180px] bg-muted border-input text-foreground">
                            <SelectValue placeholder="Filter by Category" />
                        </SelectTrigger>
                        <SelectContent className="bg-background border-border">
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map((category) => (
                                <SelectItem
                                    key={category.id}
                                    value={category.id}
                                >
                                    {category.title}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="rounded-lg border border-border bg-card shadow-lg overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="border-border hover:bg-transparent">
                            <TableHead className="text-muted-foreground">
                                Sub Category Name
                            </TableHead>
                            <TableHead className="text-muted-foreground">
                                Category
                            </TableHead>
                            <TableHead className="text-muted-foreground">
                                Path
                            </TableHead>
                            <TableHead className="text-muted-foreground">
                                Description
                            </TableHead>
                            <TableHead className="text-muted-foreground">
                                Created Date
                            </TableHead>
                            <TableHead className="text-muted-foreground text-right">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredSubCategories.map((subcategory) => (
                            <TableRow
                                key={subcategory.id}
                                className="border-border hover:bg-muted"
                            >
                                <TableCell className="font-medium text-foreground">
                                    {subcategory.title}
                                </TableCell>
                                <TableCell>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-foreground">
                                        {subcategory.category.title}
                                    </span>
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    {subcategory.path}
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    {subcategory.description}
                                </TableCell>
                                <TableCell className="text-muted-foreground whitespace-nowrap">
                                    {formatDate(subcategory.createdAt)}
                                </TableCell>
                                <TableCell className="text-right">
                                    <ActionsMenu
                                        subcategory={subcategory}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                        {filteredSubCategories.length === 0 && (
                            <TableRow>
                                <TableCell
                                    colSpan={6}
                                    className="h-24 text-center text-muted-foreground"
                                >
                                    No sub categories found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default SubCategoriesPage;
