import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Mail, Instagram, Twitter, Github } from 'lucide-react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

const executiveProfiles = {
  'gayu-baruwa': {
    name: 'Gayu Baruwa',
    role: 'Chief Executive Officer',
    bio: 'Former Wall Street Journal editor with 20+ years in journalism',
    image: '/team/gayu.jpg',
    extendedBio: `Gayu Baruwa brings over two decades of journalism excellence to GOAT NEWS. With a distinguished career at the Wall Street Journal, she has led groundbreaking coverage of major global events and transformed digital news delivery. Her vision for journalism combines traditional editorial values with cutting-edge digital innovation.`,
    achievements: [
      'Pulitzer Prize Finalist (2018)',
      'Digital Transformation Leader of the Year (2020)',
      'Named among Top 50 Media Executives by Industry Weekly',
      'Led WSJ s expansion into 12 new markets',
    ],
    contact: {
      email: 'gayubaruwa27@gmail.com',
      instagram: 'gayubrw',
      twitter: '@gayubrw',
      github: 'gayubrw',
    },
  },
  'vidiawan-nabiel-arrasyid': {
    name: 'Vidiawan Nabiel Arrasyid',
    role: 'Chief Technology Officer',
    bio: 'PhD in Computer Science, leading our digital transformation',
    image: '/team/gayu.jpg',
    extendedBio: `Dr. Vidiawan Nabiel Arrasyid leads GOAT NEWS's technological innovation and digital transformation initiatives. With a PhD in Computer Science and extensive experience in AI and machine learning, he has revolutionized how we deliver news in the digital age.`,
    achievements: [
      'Pioneered AI-driven news personalization',
      'Led development of award-winning mobile app',
      'Published 15+ research papers on ML in media',
      'Holds 5 patents in news recommendation systems',
    ],
    contact: {
      email: 'nabielvna@gmail.com',
      instagram: 'nabielvna_',
      twitter: '@nblvna_',
      github: 'nabielvna',
    },
  },
} as const;

type ExecutiveProfiles = typeof executiveProfiles;
type ValidProfileKey = keyof ExecutiveProfiles;
type ExecutiveProfile = ExecutiveProfiles[ValidProfileKey];

interface PageProps {
  params: Promise<{ name: string }>;
}

function isValidProfile(name: string): name is ValidProfileKey {
  return name in executiveProfiles;
}

const getProfile = async (name: string): Promise<ExecutiveProfile> => {
  if (!isValidProfile(name)) {
    notFound();
  }
  return executiveProfiles[name];
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;

  try {
    const profile = await getProfile(resolvedParams.name);
    return {
      title: `${profile.name} - ${profile.role} | GOAT NEWS`,
      description: profile.bio,
      openGraph: {
        title: `${profile.name} - ${profile.role}`,
        description: profile.bio,
        images: [{ url: profile.image }],
      },
    };
  } catch {
    return {
      title: 'Profile Not Found | GOAT NEWS',
      description: 'The requested profile could not be found.',
    };
  }
}

const SocialLink = ({ href, icon: Icon, label, username }: {
  href: string;
  icon: typeof Mail;
  label: string;
  username: string;
}) => (
  <div className="flex items-center gap-3 text-zinc-600 dark:text-zinc-400">
    <Icon size={20} />
    <Link
      href={href}
      target={href.startsWith('mailto') ? undefined : '_blank'}
      rel={href.startsWith('mailto') ? undefined : 'noopener noreferrer'}
      className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
      aria-label={`${label}: ${username}`}
    >
      {username}
    </Link>
  </div>
);

export default async function ProfilePage({ params }: PageProps) {
  const resolvedParams = await params;
  const profile = await getProfile(resolvedParams.name);

  return (
    <main className="min-h-screen bg-white dark:bg-black pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/about/profiles"
          className="inline-flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 mb-8 transition-colors"
          aria-label="Back to Profiles"
        >
          <ArrowLeft className="w-5 h-5" aria-hidden="true" />
          Back to Profiles
        </Link>

        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12">
          <div className="relative h-48 w-48 shrink-0">
            <Image
              src={profile.image}
              alt={`Profile photo of ${profile.name}`}
              fill
              className="object-cover rounded-full"
              priority
              sizes="(max-width: 768px) 192px, 192px"
            />
          </div>

          <div className="text-center md:text-left">
            <h1 className="text-4xl font-bold text-black dark:text-white mb-2">
              {profile.name}
            </h1>
            <div className="text-xl text-zinc-600 dark:text-zinc-400 mb-4">
              {profile.role}
            </div>
            <div className="flex gap-4 justify-center md:justify-start">
              {Object.entries({
                email: { icon: Mail, prefix: 'mailto:' },
                instagram: { icon: Instagram, prefix: 'https://instagram.com/' },
                twitter: { icon: Twitter, prefix: 'https://twitter.com/' },
                github: { icon: Github, prefix: 'https://github.com/' },
              }).map(([key, { icon: Icon, prefix }]) => (
                <Link
                  key={key}
                  href={`${prefix}${profile.contact[key as keyof typeof profile.contact]}`}
                  target={key === 'email' ? undefined : '_blank'}
                  rel={key === 'email' ? undefined : 'noopener noreferrer'}
                  className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                  aria-label={key.charAt(0).toUpperCase() + key.slice(1)}
                >
                  <Icon size={20} className="text-zinc-600 dark:text-zinc-400" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        <section className="mb-12" aria-labelledby="biography">
          <h2 id="biography" className="text-2xl font-bold text-black dark:text-white mb-4">
            Biography
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
            {profile.extendedBio}
          </p>
        </section>

        <section className="mb-12" aria-labelledby="achievements">
          <h2 id="achievements" className="text-2xl font-bold text-black dark:text-white mb-4">
            Key Achievements
          </h2>
          <ul className="space-y-2" role="list">
            {profile.achievements.map((achievement, index) => (
              <li
                key={index}
                className="text-zinc-600 dark:text-zinc-400 flex items-start gap-2"
              >
                <span className="text-blue-600 dark:text-blue-400" aria-hidden="true">•</span>
                {achievement}
              </li>
            ))}
          </ul>
        </section>

        <section
          className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-6"
          aria-labelledby="contact"
        >
          <h2 id="contact" className="text-2xl font-bold text-black dark:text-white mb-4">
            Contact Information
          </h2>
          <div className="space-y-3">
            <SocialLink
              href={`mailto:${profile.contact.email}`}
              icon={Mail}
              label="Email"
              username={profile.contact.email}
            />
            <SocialLink
              href={`https://instagram.com/${profile.contact.instagram}`}
              icon={Instagram}
              label="Instagram"
              username={profile.contact.instagram}
            />
            <SocialLink
              href={`https://twitter.com/${profile.contact.twitter}`}
              icon={Twitter}
              label="Twitter"
              username={profile.contact.twitter}
            />
            <SocialLink
              href={`https://github.com/${profile.contact.github}`}
              icon={Github}
              label="GitHub"
              username={profile.contact.github}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
