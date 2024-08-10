window.onload = async function() {
    if (window.Telegram && window.Telegram.WebApp) {
        const user = window.Telegram.WebApp.initDataUnsafe;
        const userId = user?.user?.id;
        const firstName = user?.user?.first_name || "";
        const lastName = user?.user?.last_name || "";

        // Display the username
        document.getElementById('userName').textContent = `${firstName} ${lastName}`;

        if (userId) {
            try {
                // Fetch user data from serverless function
                const response = await fetch(`/api/getUserData?userId=${userId}`);
                const data = await response.json();

                if (response.ok) {
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
                    // Initialize user data if not exists
                    await fetch('/api/updateUserData', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            userId,
                            points: 0,
                            tasksDone: 0,
                            completedTasks: []
                        })
                    });
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }

            // Handle task completion
            document.querySelectorAll('.complete-btn').forEach(button => {
                button.addEventListener('click', async function() {
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

                        // Send updated data to serverless function
                        try {
                            await fetch('/api/updateUserData', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    userId,
                                    points,
                                    tasksDone,
                                    completedTasks: [...(document.querySelectorAll('.task.completed').map(task => task.id))]
                                })
                            });
                        } catch (error) {
                            console.error('Error updating user data:', error);
                        }
                    }
                });
            });
        }
    } else {
        console.error('Telegram WebApp is not available');
    }
};
