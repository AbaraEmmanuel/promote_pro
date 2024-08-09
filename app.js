window.onload = function() {
    if (window.Telegram && window.Telegram.WebApp) {
        const user = window.Telegram.WebApp.initDataUnsafe;
        const userId = user?.user?.id;
        const firstName = user?.user?.first_name || "";
        const lastName = user?.user?.last_name || "";

        // Display the username
        document.getElementById('userName').textContent = `${firstName} ${lastName}`;

        if (userId) {
            // Fetch user data
            fetch(`https://promote-pro.vercel.app/data/${userId}`)
                .then(response => response.json())
                .then(data => {
                    if (data) {
                        document.getElementById('points').textContent = data.points || 0;
                        document.getElementById('tasksDone').textContent = data.tasksDone || 0;

                        // Mark completed tasks
                        const completedTasks = data.completedTasks || [];
                        document.querySelectorAll('.task').forEach(task => {
                            if (completedTasks.includes(task.id)) {
                                task.classList.add('completed');
                                task.querySelector('.complete-btn').textContent = 'Completed';
                            }
                        });
                    } else {
                        console.error('No data found for the user');
                    }
                })
                .catch(error => console.error('Error fetching user data:', error));

            // Handle task completion
            document.querySelectorAll('.complete-btn').forEach(button => {
                button.addEventListener('click', function() {
                    const taskId = this.getAttribute('data-task');
                    const taskElement = document.getElementById(taskId);
                    let points = parseInt(document.getElementById('points').textContent);
                    let tasksDone = parseInt(document.getElementById('tasksDone').textContent);

                    if (!taskElement.classList.contains('completed')) {
                        taskElement.classList.add('completed');
                        this.textContent = 'Completed';

                        points += 10;
                        tasksDone += 1;

                        document.getElementById('points').textContent = points;
                        document.getElementById('tasksDone').textContent = tasksDone;

                        // Send updated data to backend
                        fetch('https://promote-pro.vercel.app/update', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                userId,
                                points,
                                tasksDone,
                                completedTasks: [...(document.querySelectorAll('.task.completed').map(task => task.id))]
                            })
                        })
                        .then(response => response.json())
                        .then(data => console.log('Data successfully sent:', data))
                        .catch(error => console.error('Error sending data:', error));
                    }
                });
            });
        }
    } else {
        console.error('Telegram WebApp is not available');
    }
};
