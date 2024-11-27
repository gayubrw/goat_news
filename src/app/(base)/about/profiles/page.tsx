import Image from 'next/image';
import Link from 'next/link';

export default function GoatNewsProfile() {
    const executives = [
        {
            name: 'Gayu Baruwa',
            role: 'Chief Executive Officer',
            bio: 'Former Wall Street Journal editor with 20+ years in journalism',
            image: '/team/gayu.jpg',
            social: { linkedin: '#', twitter: '#' },
            slug: 'gayu-baruwa'
        },
        {
            name: 'Vidiawan Nabiel Arrasyid',
            role: 'Chief Technology Officer',
            bio: 'PhD in Computer Science, leading our digital transformation',
            image: '/team/gayu.jpg',
            social: { linkedin: '#', twitter: '#' },
            slug: 'vidiawan-nabiel-arrasyid'
        },
        {
            name: 'Stevanza Gian Maheswara',
            role: 'Editor-in-Chief',
            bio: 'Award-winning journalist with expertise in investigative reporting',
            image: '/team/gayu.jpg',
            social: { linkedin: '#', twitter: '#' },
            slug: 'stevanza-gian-maheswara'
        },
        {
            name: 'M. Fadhil Abhista Daniswara',
            role: 'Chief Content Officer',
            bio: 'Digital media strategist with a background in multimedia journalism',
            image: '/team/gayu.jpg',
            social: { linkedin: '#', twitter: '#' },
            slug: 'm-fadhil-abhista-daniswara'
        }
    ];

    return (
        <div className="min-h-screen bg-white dark:bg-black pt-24 pb-20">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header Section */}
                <div className="text-center mb-16">
                    <h1 className="font-['Germania_One'] text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-500 dark:from-zinc-100 dark:to-zinc-500">
                        GOAT NEWS Profiles
                    </h1>
                </div>

                {/* Profiles Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {executives.map((exec) => (
                        <Link
                            href={`/about/profiles/${exec.slug}`}
                            key={exec.name}
                            className="group"
                        >
                            <div className="relative aspect-[4/3] mb-4 bg-gray-100">
                                <Image
                                    src={exec.image}
                                    alt={exec.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <h3 className="text-lg font-semibold mb-1 group-hover:text-blue-600">
                                {exec.name}
                            </h3>
                            <p className="text-sm text-gray-600">{exec.role}</p>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
