window.onload = function() {
    if (window.Telegram && window.Telegram.WebApp) {
        const user = window.Telegram.WebApp.initDataUnsafe;

        const userId = user?.user?.id;
        const username = user?.user?.username || "Username";
        const firstName = user?.user?.first_name || "";
        const lastName = user?.user?.last_name || "";

        // Display the username in the original format
        document.getElementById('userName').textContent = `${firstName} ${lastName}`;

        if (userId) {
            fetch(`https://promote-pro.vercel.app/data/${userId}`)
                .then(response => response.json())
                .then(data => {
                    document.getElementById('points').textContent = data.points || 0;
                    document.getElementById('tasksDone').textContent = data.tasksDone || 0;
                    const completedTasks = data.completedTasks || [];
                    document.querySelectorAll('.task').forEach(task => {
                        if (completedTasks.includes(task.id)) {
                            task.classList.add('completed');
                            task.querySelector('.complete-btn').textContent = 'Completed';
                        }
                    });
                })
                .catch(error => console.error('Error fetching user data:', error));

            document.querySelectorAll('.complete-btn').forEach(button => {
                button.addEventListener('click', function() {
                    const taskId = this.getAttribute('data-task');
                    const taskElement = document.getElementById(taskId);
                    const points = parseInt(document.getElementById('points').textContent);
                    const tasksDone = parseInt(document.getElementById('tasksDone').textContent);

                    if (!taskElement.classList.contains('completed')) {
                        taskElement.classList.add('completed');
                        this.textContent = 'Completed';

                        // Update points and tasks done
                        document.getElementById('points').textContent = points + 10;
                        document.getElementById('tasksDone').textContent = tasksDone + 1;

                        // Save changes to backend
                        if (userId) {
                            fetch('https://promote-pro.vercel.app/update', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    userId,
                                    points: points + 10,
                                    tasksDone: tasksDone + 1,
                                    completedTasks: [...completedTasks, taskId]
                                })
                            })
                            .then(response => response.json())
                            .then(data => console.log('Data successfully sent:', data))
                            .catch(error => console.error('Error sending data:', error));
                        }
                    }
                });
            });
        }
    } else {
        console.error('Telegram WebApp is not available');
    }
};
