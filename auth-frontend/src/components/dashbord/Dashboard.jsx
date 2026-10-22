
export default function DashboardPage({ user, onLogout }) {
    return (
        <main className="dashboard-page">
            <h1>Welcome to Verdant</h1>
            <p>You have successfully logged in.</p>
            <p>Username: {user?.username || "User"}</p>
            <p>Email: {user?.email || "Not available"}</p>

            <button type="button" onClick={onLogout}>
                Logout
            </button>
        </main>
    );
}
