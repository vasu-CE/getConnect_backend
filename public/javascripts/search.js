const input = document.querySelector('#search');

input.addEventListener('keyup', async (event) => {
    // console.log(event.target.value);
    key = event.target.value;
    if(key==""){
        ul.innerHTML= "";
    }
    console.log(key);
    const ul = document.querySelector('#list');
    ul.innerHTML = "";
    try {
        const response = await fetch('/search');
        const data = await response.json(); 
        const users = data.map((data) => {
           return data;
        })
        // console.log(users);
        const searchedUsers = users.filter((user) => {
            return user.userName.startsWith(key);
        });
        // console.log(searchedUsers);
        searchedUsers.forEach((user) => {
            const li = document.createElement('li');
            // li.innerHTML = `${user.userName} (ID: ${user._id})`;
            const a = document.createElement('a');
            a.href = `/view/${user._id}/profile`;
            a.innerHTML = `${user.userName}`; 
            a.style.color = 'blue';

            li.appendChild(a);
            ul.appendChild(li);
        })
        
    } catch (error) {
        console.error("Error fetching search results:", error);
    }
});
