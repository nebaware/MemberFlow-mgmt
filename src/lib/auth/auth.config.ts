import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { dbQuery } from "@/lib/db/db";

export const authOptions: NextAuthOptions = {
    // No adapter - using pure Credentials flow with SQLite
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                console.log("Authorize called for:", credentials?.email);
                if (!credentials?.email || !credentials?.password) {
                    console.log("Missing credentials");
                    throw new Error("Invalid credentials");
                }

                // Use dbQuery for robust SQLite support
                const rows = await dbQuery(
                    `SELECT id, email, name, role, password_hash FROM users WHERE email = $1`,
                    [credentials.email]
                );
                console.log("DB Lookup Result Rows:", rows.length);

                const user: any = rows[0];

                if (!user || !user.password_hash) {
                    console.log("User not found or no password hash");
                    throw new Error("Invalid credentials");
                }

                const isPasswordValid = await bcrypt.compare(
                    credentials.password,
                    user.password_hash
                );
                console.log("Password validation result:", isPasswordValid);

                if (!isPasswordValid) {
                    console.log("Expected Password:", credentials.password);
                    console.log("Stored Hash:", user.password_hash);
                    throw new Error("Invalid credentials");
                }

                return {
                    id: String(user.id),
                    email: user.email,
                    name: user.name,
                    role: user.role,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role;
                token.id = user.id;
                // Fetch license verification status from database
                try {
                    // Use dbQuery instead of prisma
                    const rows = await dbQuery(
                        `SELECT role, license_verified as "licenseVerified", verification_status as "verificationStatus", license_number as "licenseNumber" FROM users WHERE id = $1`,
                        [user.id]
                    );
                    const dbUser: any = rows[0];

                    if (dbUser) {
                        token.licenseVerified = Boolean(dbUser.licenseVerified);
                        token.verificationStatus = dbUser.verificationStatus || 'pending';
                        token.role = dbUser.role;
                    } else {
                        token.licenseVerified = false;
                        token.verificationStatus = 'pending';
                    }
                } catch (err) {
                    console.error('Error fetching user license status:', err);
                    token.licenseVerified = false;
                    token.verificationStatus = 'pending';
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.role = token.role as string;
                session.user.id = token.id as string;
                session.user.licenseVerified = token.licenseVerified as boolean;
                session.user.verificationStatus = token.verificationStatus as string;
            }
            return session;
        },
    },
    pages: {
        signIn: "/en/login",
        signOut: "/en/login",
        error: "/en/login",
    },
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    secret: process.env.NEXTAUTH_SECRET || "azmera-secret-key-change-in-production",
};
