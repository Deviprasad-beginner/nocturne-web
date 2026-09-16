import { Footer } from "@/components/footer";
import { Link } from "wouter";
import { ArrowLeft, Shield, BookOpen, MessageCircle, HeartHandshake, Eye } from "lucide-react";

// Common Layout for Static Pages
function StaticLayout({ title, icon: Icon, children }: { title: string, icon: React.ElementType, children: React.ReactNode }) {
    return (
        <div className="min-h-screen relative flex flex-col bg-transparent text-gray-300">
            {/* Background Image */}
            <div
                className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: `url('/assets/cosmic-background.jpg')`,
                    backgroundColor: '#0f172a'
                }}
            >
                <div className="absolute inset-0 bg-black/60 mix-blend-overlay" />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col items-center py-16 px-4 z-10">
                
                {/* Back Button */}
                <div className="w-full max-w-3xl mb-8 flex items-center justify-between">
                    <Link href="/auth">
                        <a className="flex items-center text-gray-400 hover:text-white transition-colors">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back
                        </a>
                    </Link>
                </div>

                {/* Content Card */}
                <div className="w-full max-w-3xl bg-[#111422]/90 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-8 md:p-12">
                    <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-6">
                        <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                            <Icon className="w-6 h-6 text-indigo-400" />
                        </div>
                        <h1 className="text-3xl font-bold text-white">{title}</h1>
                    </div>
                    
                    <div className="space-y-6 text-sm leading-relaxed text-gray-400 font-sans">
                        {children}
                    </div>
                </div>
            </div>

            {/* Detailed Footer */}
            <Footer />
        </div>
    );
}

// -----------------------------------------------------
// PAGE COMPONENTS
// -----------------------------------------------------

export function AboutPage() {
    return (
        <StaticLayout title="About Nocturne" icon={BookOpen}>
            <p className="text-lg text-gray-300">
                The night is unwritten. Welcome to Nocturne, a sanctuary built for the sleepless, the dreamers, and the thinkers.
            </p>
            <h2 className="text-white text-xl font-semibold mt-8 mb-4">Our Vision</h2>
            <p>
                We believe that human connection is often most authentic when stripped of identity, status, and daylight pressures. Nocturne is an "anti-social" network. We don't care about your follower count, your real name, or your curated aesthetic. 
            </p>
            <p>
                Here, your thoughts stand alone in the void. Whether you are seeking a midnight cafe to relax in, a raw feed of unedited whispers, or an encrypted vault for your deepest diaries, Nocturne provides the space.
            </p>
            <h2 className="text-white text-xl font-semibold mt-8 mb-4">The Architecture of Silence</h2>
            <p>
                Every feature on this platform was designed with late-night psychology in mind. Dark mode isn't a toggle; it's the foundation. Animations are minimal and soothing. Data is heavily encrypted. Everything is built to help you decompress, not doomscroll.
            </p>
        </StaticLayout>
    );
}

export function PrivacyPolicyPage() {
    return (
        <StaticLayout title="Privacy Policy" icon={Shield}>
            <p className="text-gray-300 italic mb-4">Last updated: September 13, 2026</p>
            
            <h2 className="text-white text-lg font-semibold mt-6 mb-3">1. The Encrypted Vault (Zero-Knowledge)</h2>
            <p>
                Your private entries (Night Diaries) are encrypted using AES-256-GCM cryptography *before* they are stored in our database. We do not have the keys to read your private thoughts. In the event of a database breach, your data remains cryptographically secure.
            </p>
            
            <h2 className="text-white text-lg font-semibold mt-6 mb-3">2. Ephemeral Data (The Void)</h2>
            <p>
                Anonymity is our core feature. "Whispers" and "Night Circles" chats that are marked as temporary are actively scrubbed from our servers via automated cron jobs. We do not maintain historical archives of ephemeral content.
            </p>

            <h2 className="text-white text-lg font-semibold mt-6 mb-3">3. Tracking & Cookies</h2>
            <p>
                We use strictly necessary cookies to maintain your encrypted session state. We do not use third-party advertising trackers, Facebook pixels, or invasive telemetry. Your activity in Nocturne is your own.
            </p>

            <h2 className="text-white text-lg font-semibold mt-6 mb-3">4. Account Erasure</h2>
            <p>
                You have the absolute right to vanish. Navigating to the Account settings and selecting "Delete Account" will invoke a hard-delete across all relational database tables associated with your ID. No soft-deletes. No ghost profiles.
            </p>
        </StaticLayout>
    );
}

export function TermsPage() {
    return (
        <StaticLayout title="Terms of Service" icon={Eye}>
            <p className="text-gray-300 italic mb-4">Last updated: September 13, 2026</p>
            
            <h2 className="text-white text-lg font-semibold mt-6 mb-3">Acceptance of Terms</h2>
            <p>
                By accessing Nocturne, you agree to these Terms. If you do not agree, please do not use the platform. Nocturne is provided "as-is", primarily designed as an experimental digital space.
            </p>
            
            <h2 className="text-white text-lg font-semibold mt-6 mb-3">User Conduct</h2>
            <p>
                While Nocturne encourages raw, unfiltered thought, we strictly prohibit:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Harassment, targeted abuse, or doxxing of other users.</li>
                <li>Posting illegal content or content that incites violence.</li>
                <li>Attempting to deanonymize users utilizing the anonymous features.</li>
                <li>Spamming the Midnight Cafe or Night Circles.</li>
            </ul>

            <h2 className="text-white text-lg font-semibold mt-6 mb-3">Service Availability</h2>
            <p>
                Nocturne is maintained by a small team (and AI). We strive for 99.9% uptime, but we do not guarantee uninterrupted access. We reserve the right to modify or discontinue features as the platform evolves.
            </p>
        </StaticLayout>
    );
}

export function GuidelinesPage() {
    return (
        <StaticLayout title="Community Guidelines" icon={HeartHandshake}>
            <p className="text-lg text-gray-300 mb-6">
                Nocturne is a unique ecosystem. To maintain the vibe of a late-night sanctuary, we ask all members to observe the following unwritten rules:
            </p>

            <div className="space-y-6">
                <div>
                    <h3 className="text-white font-medium text-base">1. Respect the Silence</h3>
                    <p className="mt-1">
                        Do not bring daytime noise into the night. Avoid aggressive political debates, viral outrage farming, or loud self-promotion. Keep it contemplative.
                    </p>
                </div>
                <div>
                    <h3 className="text-white font-medium text-base">2. Embrace Anonymity Responsibly</h3>
                    <p className="mt-1">
                        Anonymity is a shield for vulnerability, not a sword for cruelty. Use your facelessness to share your fears, dreams, and art—not to attack others.
                    </p>
                </div>
                <div>
                    <h3 className="text-white font-medium text-base">3. Hold Space in Night Circles</h3>
                    <p className="mt-1">
                        When participating in Night Circles or the Midnight Cafe, listen as much as you speak. Acknowledge others before pivoting the topic to yourself.
                    </p>
                </div>
            </div>
        </StaticLayout>
    );
}

export function ContactPage() {
    return (
        <StaticLayout title="Get in Touch" icon={MessageCircle}>
            <p className="text-lg text-gray-300 mb-6">
                Have a question, concern, or just want to share a midnight thought?
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
                    <h3 className="text-white font-medium mb-2">Technical Support</h3>
                    <p className="text-sm mb-4">Experiencing bugs or issues with your encrypted vault?</p>
                    <a href="mailto:support@nocturnesocial.in" className="text-indigo-400 hover:text-indigo-300">support@nocturnesocial.in</a>
                </div>
                <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
                    <h3 className="text-white font-medium mb-2">General Inquiries</h3>
                    <p className="text-sm mb-4">Partnerships, media, or general questions about our vision.</p>
                    <a href="mailto:hello@nocturnesocial.in" className="text-indigo-400 hover:text-indigo-300">hello@nocturnesocial.in</a>
                </div>
            </div>
        </StaticLayout>
    );
}
