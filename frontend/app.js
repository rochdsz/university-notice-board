document.addEventListener("DOMContentLoaded", () => {
    fetchNotices();

    document.getElementById("feedback-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const student_name = document.getElementById("student_name").value;
        const message = document.getElementById("message").value;

        try {
            const res = await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ student_name, message })
            });
            if (res.ok) {
                alert("Feedback submitted successfully!");
                e.target.reset();
            } else {
                alert("Failed to submit feedback.");
            }
        } catch (error) {
            console.error("Error submitting feedback:", error);
        }
    });
});

async function fetchNotices() {
    const list = document.getElementById("notices-list");
    try {
        const res = await fetch('/api/notices');
        const notices = await res.json();
        
        if (notices.length === 0) {
            list.innerHTML = "<p>No active notices at this time.</p>";
            return;
        }

        list.innerHTML = notices.map(n => `
            <div style="border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 10px;">
                <strong>${n.title}</strong><br>
                <small>${new Date(n.created_at).toLocaleString()}</small>
                <p style="margin: 5px 0 0 0;">${n.content}</p>
            </div>
        `).join('');
    } catch (error) {
        list.innerHTML = "<p style='color: red;'>Error loading notices.</p>";
        console.error("Error fetching notices:", error);
    }
}