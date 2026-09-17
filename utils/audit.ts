// utils/audit.ts
export const trackUiEvent = async (
  action: string,
  resource: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: any,
) => {
  try {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/audit/client-event`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // 'Authorization': `Bearer ${localStorage.getItem('token')}` // If needed
      },
      body: JSON.stringify({
        category: "SYSTEM",
        action,
        resource,
        metadata,
      }),
    });
  } catch (error) {
    console.error("Failed to log UI event", error);
  }
};
