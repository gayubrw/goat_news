import React from 'react';
import Image from 'next/image';
import { GithubIcon, InstagramIcon, TwitterIcon } from 'lucide-react';

export default function AboutPage() {
    const executives = [
        {
            name: 'Gayu Baruwa',
            role: 'Chief Executive Officer',
            bio: 'Former Wall Street Journal editor with 20+ years in journalism',
            image: '/team/gayu.jpg',
            social: {
                instagram: 'https://instagram.com/gayubrw',
                twitter: 'https://twitter.com/gayubrw',
                github: 'https://github.com/gayubrw',
            },
        },
        {
            name: 'Vidiawan Nabiel Arrasyid',
            role: 'Chief Technology Officer',
            bio: 'PhD in Computer Science, leading our digital transformation',
            image: '/team/gayu.jpg',
            social: {
                instagram: 'https://instagram.com/vidiawannabiel',
                twitter: 'https://twitter.com/vidiawannabiel',
                github: 'https://github.com/vidiawannabiel',
            },
        },
        {
            name: 'Stevanza Gian Maheswara',
            role: 'Editor-in-Chief',
            bio: 'Award-winning journalist with expertise in investigative reporting',
            image: '/team/gayu.jpg',
            social: {
                instagram: 'https://instagram.com/stevanzagian',
                twitter: 'https://twitter.com/stevanzagian',
                github: 'https://github.com/stevanzagian',
            },
        },
        {
            name: '-',
            role: '-',
            bio: '-',
            image: '/goat.png',
            social: {
                instagram: '#',
                twitter: '#',
                github: '#',
            },
        },
    ];

    const splatterPaths = [
        'M41.1,-70.6C53.9,-64.3,65.3,-54.2,73.7,-41.7C82.1,-29.1,87.5,-14.6,87.2,-0.2C86.9,14.2,80.8,28.4,72.5,41.1C64.2,53.8,53.6,65,40.5,71.7C27.4,78.4,11.7,80.6,-2.4,84.3C-16.5,88,-33,93.2,-45.5,87.7C-58,82.2,-66.5,66,-74,50.5C-81.5,35,-88,17.5,-89.1,-0.6C-90.2,-18.8,-85.9,-37.5,-76.1,-51.8C-66.4,-66,-51.3,-75.7,-36.2,-80.8C-21,-85.9,-5.8,-86.4,7.1,-98.5C20,-110.6,40,-110.3,41.1,-70.6Z',
        'M44.3,-75.8C57.4,-69.1,68.1,-56.9,76.3,-42.8C84.5,-28.7,90.2,-12.8,88.8,2.3C87.4,17.3,79,32.5,68.6,45.1C58.2,57.7,45.9,67.7,31.9,73.4C17.9,79.1,2.2,80.5,-12.8,77.8C-27.8,75.1,-42.2,68.3,-54.1,58.4C-66,48.5,-75.5,35.5,-80.8,20.5C-86.1,5.5,-87.3,-11.5,-82.9,-26.6C-78.4,-41.8,-68.3,-55,-55.1,-62.4C-41.9,-69.8,-25.6,-71.4,-9.9,-70.8C5.8,-70.2,23.6,-67.4,44.3,-75.8Z',
        'M38.1,-64.9C49.2,-59.2,58.1,-48.9,66.5,-37.2C74.9,-25.5,82.8,-12.7,83.9,0.7C84.9,14,79,27.9,70.8,39.7C62.5,51.4,51.8,60.9,39.5,66.7C27.2,72.5,13.6,74.6,-0.2,74.9C-14,75.2,-27.9,73.8,-40.4,68C-52.9,62.2,-63.9,52.1,-71.7,39.6C-79.5,27,-84,13.5,-84.2,-0.1C-84.4,-13.7,-80.3,-27.4,-72.6,-38.8C-64.9,-50.2,-53.7,-59.3,-41.2,-64.5C-28.7,-69.6,-14.4,-70.8,-0.2,-70.4C13.9,-70,27.8,-68,38.1,-64.9Z',
        'M42.7,-73.2C54.5,-67.4,62.8,-54.7,70.4,-41.3C78,-27.8,84.9,-13.9,85.4,0.3C85.9,14.5,80,29,71.7,41.4C63.4,53.8,52.7,64.1,40,70.4C27.3,76.7,12.7,79,-1.5,81.5C-15.7,84,-31.4,86.8,-45.1,82.1C-58.8,77.4,-70.5,65.2,-77.7,50.8C-84.9,36.4,-87.6,19.9,-87.1,3.8C-86.6,-12.3,-82.8,-24.7,-76.3,-35.8C-69.8,-46.9,-60.5,-56.8,-48.7,-62.6C-36.9,-68.4,-22.7,-70.1,-8.2,-71.1C6.3,-72,18.9,-72.2,42.7,-73.2Z',
    ];

    return (
        <div className="min-h-screen bg-white dark:bg-black">
            <div className="max-w-7xl mx-auto px-4">
                {/* About Section */}
                <div className="py-20">
                    <div className="text-center mb-16">
                        <h1 className="text-4xl md:text-6xl font-bold mb-6 text-black dark:text-white">
                            About GOAT NEWS
                        </h1>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
                        <div className="relative h-[600px]">
                            <Image
                                src="/goat.png"
                                alt="Newsroom"
                                fill
                                className="object-cover rounded-lg"
                            />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold mb-6 text-black dark:text-white">
                                Our Mission
                            </h2>
                            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                                At GOAT NEWS, we strive to be the most trusted
                                source of news and information. Our commitment
                                to journalistic excellence drives us to deliver
                                accurate, unbiased, and timely news coverage
                                across all platforms.
                            </p>
                            <p className="text-zinc-600 dark:text-zinc-400">
                                Founded in 2024, we have quickly established
                                ourselves as a leading voice in digital
                                journalism, combining traditional reporting
                                values with cutting-edge technology.
                            </p>
                        </div>
                    </div>

                    {/* Team Section */}
                    <div className="space-y-10 pt-20">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-bold text-black dark:text-white">
                                Meet the Team
                            </h2>
                        </div>

                        {executives.map((exec, index) => (
                            <div
                                key={exec.name}
                                className={`flex flex-col ${
                                    index % 2 === 0
                                        ? 'md:flex-row'
                                        : 'md:flex-row-reverse'
                                }
                                    items-center gap-8 ${
                                        index % 2 === 0
                                            ? 'md:pr-12'
                                            : 'md:pl-12'
                                    }`}
                            >
                                {/* Paint Splatter Image Container */}
                                <div className="w-full md:w-1/4 relative">
                                    <div className="relative aspect-square">
                                        {/* Paint Splatter Shape */}
                                        <div className="absolute inset-0">
                                            <svg
                                                viewBox="-100 -100 200 200"
                                                className="w-full h-full transform"
                                            >
                                                <path
                                                    d={
                                                        splatterPaths[
                                                            index %
                                                                splatterPaths.length
                                                        ]
                                                    }
                                                    fill="currentColor"
                                                    className="text-blue-500/10 dark:text-blue-400/10"
                                                />
                                            </svg>
                                        </div>

                                        {/* Image Mask */}
                                        <div className="absolute inset-0 overflow-hidden">
                                            <svg
                                                viewBox="-100 -100 200 200"
                                                className="w-full h-full transform"
                                            >
                                                <defs>
                                                    <clipPath
                                                        id={`clip-${index}`}
                                                    >
                                                        <path
                                                            d={
                                                                splatterPaths[
                                                                    index %
                                                                        splatterPaths.length
                                                                ]
                                                            }
                                                        />
                                                    </clipPath>
                                                </defs>
                                                <foreignObject
                                                    width="200"
                                                    height="200"
                                                    x="-100"
                                                    y="-100"
                                                    clipPath={`url(#clip-${index})`}
                                                >
                                                    <div className="w-full h-full relative">
                                                        <Image
                                                            src={exec.image}
                                                            alt={exec.name}
                                                            fill
                                                            className="object-cover hover:scale-105 transition-transform duration-500"
                                                        />
                                                    </div>
                                                </foreignObject>
                                            </svg>
                                        </div>

                                        {/* Small Splatter Decorations */}
                                        <div
                                            className={`absolute w-8 h-8 ${
                                                index % 2 === 0
                                                    ? '-right-2 top-1/4'
                                                    : '-left-2 bottom-1/4'
                                            }`}
                                        >
                                            <svg viewBox="-100 -100 200 200">
                                                <path
                                                    d={
                                                        splatterPaths[
                                                            (index + 1) %
                                                                splatterPaths.length
                                                        ]
                                                    }
                                                    fill="currentColor"
                                                    className="text-purple-500/20 dark:text-purple-400/20"
                                                />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="w-full md:w-3/4 space-y-3">
                                    <div className="space-y-1">
                                        <h3 className="text-2xl font-bold text-black dark:text-white">
                                            {exec.name}
                                        </h3>
                                        <p className="text-blue-600 dark:text-blue-400 font-medium">
                                            {exec.role}
                                        </p>
                                    </div>

                                    <p className="text-zinc-600 dark:text-zinc-400">
                                        {exec.bio}
                                    </p>

                                    <div className="flex gap-4 pt-2">
                                        <a
                                            href={exec.social.instagram}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-zinc-400 hover:text-blue-600 transition-colors"
                                            aria-label={`${exec.name}'s Instagram`}
                                        >
                                            <InstagramIcon className="h-5 w-5" />
                                        </a>
                                        <a
                                            href={exec.social.twitter}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-zinc-400 hover:text-blue-600 transition-colors"
                                            aria-label={`${exec.name}'s Twitter`}
                                        >
                                            <TwitterIcon className="h-5 w-5" />
                                        </a>
                                        <a
                                            href={exec.social.github}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-zinc-400 hover:text-blue-600 transition-colors"
                                            aria-label={`${exec.name}'s GitHub`}
                                        >
                                            <GithubIcon className="h-5 w-5" />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
