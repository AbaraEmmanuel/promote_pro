window.onload = function() {
    if (window.Telegram && window.Telegram.WebApp) {
        const user = window.Telegram.WebApp.initDataUnsafe;
        console.log('User Data:', user);

        const userId = user?.user?.id;
        const username = user?.user?.username || "Username";
        const firstName = user?.user?.first_name || "";
        const lastName = user?.user?.last_name || "";

        document.getElementById('userName').textContent = `${firstName} ${lastName}`;

        if (userId) {
            fetch(`https://promote-pro.vercel.app/data/${userId}`)
                .then(response => response.json())
                .then(data => {
                    const points = data.points || 0;
                    const tasksDone = data.tasksDone || 0;
                    const tasks = data.tasks || {};

                    document.getElementById('points').textContent = points;
                    document.getElementById('tasksDone').textContent = tasksDone;

                    // Restore task completion state
                    Object.keys(tasks).forEach(taskId => {
                        const taskElement = document.getElementById(taskId);
                        if (tasks[taskId].completed) {
                            taskElement.classList.add('completed');
                            taskElement.querySelector('.complete-btn').textContent = 'Completed';
                        }
                    });
                })
                .catch(error => console.error('Error fetching user data:', error));
        }

        document.querySelectorAll('.complete-btn').forEach(button => {
            button.addEventListener('click', function() {
                const taskId = this.getAttribute('data-task');
                const taskElement = document.getElementById(taskId);

                if (!taskElement.classList.contains('completed')) {
                    let points = parseInt(document.getElementById('points').textContent);
                    let tasksDone = parseInt(document.getElementById('tasksDone').textContent);

                    points += 10;
                    tasksDone += 1;
                    taskElement.classList.add('completed');
                    this.textContent = 'Completed';
                    document.getElementById('points').textContent = points;
                    document.getElementById('tasksDone').textContent = tasksDone;

                    if (userId) {
                        const tasks = {};
                        document.querySelectorAll('.task').forEach(task => {
                            const taskId = task.id;
                            tasks[taskId] = { completed: task.classList.contains('completed') };
                        });

                        sendDataToServer(userId, points, tasksDone, tasks);
                    }
                }
            });
        });
    } else {
        console.error('Telegram WebApp is not available');
    }
};

function sendDataToServer(userId, points, tasksDone, tasks) {
    fetch('https://promote-pro.vercel.app/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, points, tasksDone, tasks })
    })
    .then(response => response.json())
    .then(data => console.log('Data successfully sent:', data))
    .catch(error => console.error('Error sending data:', error));
}
