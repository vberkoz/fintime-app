import type { Activity } from "../types";

const apiBaseUrl = import.meta.env.DEV
    ? import.meta.env.VITE_API_BASE_URL
    : "";

export const fetchActivities = async (selectedDay: string, accessToken: string, cognitoUsername: string): Promise<Activity[]> => {
    if (!selectedDay) {
        return []; // Return empty array if no day is selected
    }

    const url = `${apiBaseUrl}/api/activities/${cognitoUsername}/day/${selectedDay}`; // Append sorting parameter

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken || ""}`,
            },
        });

        if (response.status === 404) {
            // Handle 404 specifically - this is expected when no activities exist
            const errorData = await response.json();
            if (errorData.message === "No activities found for the given day") {
                return []; // Return empty array instead of throwing
            }
        }

        if (!response.ok) {
            throw new Error("Failed to fetch activities");
        }
        return response.json();
    } catch (error) {
        if (error instanceof Error &&
            error.message === "No activities found for the given day") {
            return []; // Return empty array for this specific error
        }
        throw error; // Re-throw other errors
    }
}

// Create a new activity
export const createActivity = async (activity: Activity, accessToken: string, cognitoUsername: string): Promise<Activity> => {
    try {
        const response = await fetch(`${apiBaseUrl}/api/activities`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken || ""}`,
            },
            body: JSON.stringify({ userId: cognitoUsername, endDate: activity.endDate, data: activity }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to create driver');
        }

        return response.json();
    } catch (error) {
        console.error('Error creating driver:');
        throw error; // Re-throw the error for useMutation to handle
    }
};

// Remove an activity
export const removeActivity = async ({ endDate, activityId }: { endDate: string, activityId: string }, accessToken: string, cognitoUsername: string): Promise<Activity> => {
    try {
        const response = await fetch(`${apiBaseUrl}/api/activities/${cognitoUsername}/${endDate}/${activityId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken || ""}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to remove driver');
        }

        return response.json();
    } catch (error) {
        console.error('Error removing driver:');
        throw error; // Re-throw the error for useMutation to handle
    }
};