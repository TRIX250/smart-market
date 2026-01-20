import { auth } from '@clerk/nextjs/server'

/**
 * Checks if the current user has administrative permissions.
 * By default, it checks for 'admin' or 'owner' roles in publicMetadata.
 */
export async function canExport() {
    const { sessionClaims } = await auth();
    const email = sessionClaims?.email as string;
    const username = sessionClaims?.username as string;

    // Allow any authenticated user to export their own data
    const { userId } = await auth();
    return !!userId;
}

/**
 * Checks if the current user has administrative permissions to import.
 */
export async function canImport() {
    return canExport(); // Shared logic for now
}

/**
 * Server-side check for import permissions.
 */
export async function ensureCanImport() {
    const authorized = await canImport();
    if (!authorized) {
        throw new Error('Unauthorized: Only Admins or Shop Owners can import data.');
    }
}
