export function LoadingSpinner({ size = "default" }: { size?: "default" | "large" }) {
    return (
        <span
            className={`spinner ${size === "large" ? "loading__spinner" : ""}`}
            role="status"
            aria-label="Loading"
        />
    );
}
