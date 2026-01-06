document.addEventListener('DOMContentLoaded', () => {

    let user_query = document.getElementById('api_search_input');
    let search_query_btn = document.getElementById('search_btn');
    const result_Github = document.getElementById('GitHub_results');
    const result_Weather = document.getElementById('Weather_results');
    const result_Crypto = document.getElementById('Crypto_results');
    const Github_dropdown = document.getElementById('Github_dropdown');
    const Weather_dropdown = document.getElementById('Weather_dropdown');
    const Crypto_dropdown = document.getElementById('Crypto_dropdown');

    search_query_btn.addEventListener('click', () => {
        identifySeachType();
    });

    const alert_modal = document.getElementById('error_alert');
    alert_modal.addEventListener('click', (e) => {
        if (e.target.id === 'error_alert') {
            closeErrorAlert();
        }
    });
    window.addEventListener('keydown', (e => {
        if (e.key == "Escape" || e.key === " " || e.key === "Enter") {
            closeErrorAlert();
        }
    }))
    document.getElementById('close_btn').addEventListener('click', (e) => {
        closeErrorAlert();
    })


    function ErrorAlert(msg) {
        document.getElementById('error_alert_text').innerText = msg;
        alert_modal.classList.remove('hidden');
        alert_modal.classList.add('flex');
    }

    function closeErrorAlert() {
        alert_modal.classList.add('hidden');
        alert_modal.classList.remove('flex');
    }


    let selected_type_search = document.getElementById('selected_text');
    function identifySeachType() {
        const btnElement = document.getElementById('selected_text');

        if (!btnElement) {
            console.error("Could not find the API selection button!");
            return;
        }

        const query = user_query.value.trim();
        const activeAPI = btnElement.textContent.trim();

        const searchMap = {
            "GitHub": GitHub_Search,
            "Weather": Weather_Search,
            "Crypto": Crypto_Search
        };

        if (activeAPI.includes("Search Options")) {
            ErrorAlert("Please select an API first.");
            return;
        }

        if (searchMap[activeAPI]) {
            searchMap[activeAPI](query);
        } else {
            ErrorAlert("Please select a valid API.");
        }
    }


    async function GitHub_Search(query) {
        const userUrl = `https://api.github.com/search/users?q=${query}&per_page=5`;
        const repoUrl = `https://api.github.com/search/repositories?q=${query}&per_page=5`;

        result_Github.innerHTML = "Searching ...";
        result_Github.classList.add("text-white");
        try {
            const data = await Promise.any([
                fetch(userUrl).then(res => {
                    if (!res.ok) {
                        result_Github.innerHTML = " ";
                        throw new Error("User API Failed");
                    }
                    return res.json();
                }),
                fetch(repoUrl).then(res => {
                    if (!res.ok) {
                        result_Github.innerHTML = " ";
                        throw new Error("Repo API Failed");
                    }
                    return res.json();
                })
            ]);

            display_GitHub_results(data);

        } catch (err) {
            ErrorAlert("Please search something valid ");
            store_error("GitHub Search failed: " + err.message);
        }
    }

    function display_GitHub_results(search_results) {

        if (!search_results) {
            result_Github.innerHTML = `System Error No data Found `;
            store_error(`System error , no data found (${user_query.value}) `);
            return;
        }

        if (search_results instanceof Error) {
            result_Github.innerHTML = `Found ${search_results.message}`;
            store_error(`Got an error !! on query (${user_query.value}) try again in some moments`);
            return;
        }

        if (!search_results.items || search_results.items.length == 0) {
            result_Github.innerHTML = `No result found `;
            store_error(` No result found on given query (${user_query.value})`);
            return;
        }

        const user = search_results.items[0];
        if (user.login) {
            result_Github.innerHTML = '<p class="text-xl text-center text-white"> Found User </p>';
        }
        else if (user.full_name) {
            result_Github.innerHTML = `<p class="text-xl text-center text-white"> Found Repository : ${user.full_name} </p>`;
        }
        const profilPic = user.avatar_url;
        const accountType = user.type;
        result_Github.innerHTML += `
            <div class="gap-4 flex flex-col items-center">
            <img src="${profilPic}" class="h-16 w-16 border-0 rounded-3xl">
            <span>
                <p class="p-2 text-white"> Account Type : ${accountType} </p> 
            </span>
            </div> `;
    }


    async function Weather_Search(query_search) {
        if (!query_search) {
            ErrorAlert("Please enter City Name to search weather ");
            store_error("Please enter City Name to search weather ");
            return;
        }
        result_Weather.innerHTML = `<p class="text-white"> Searching ... </p>`;
        const api_key = "72c671ea566748cdb6491455253112";
        const city = query_search;
        const Weather_api_url = `https://api.weatherapi.com/v1/current.json?key=${api_key}&q=${city}`;

        const response = await fetch(Weather_api_url);
        if (!response.ok) {
            result_Weather.innerHTML = '<p class="text-white">Search Not Found </p>';
            store_error("API Server is down / Search something valid");
            return;
        }
        const data = await response.json();

        if (!data || !data.current) {
            result_Weather.innerHTML = `Search Not found `;
            store_error(`search with correct query ( ${query_search} !! )`);
            return;
        }
        const temp = data.current.temp_c;
        const icon = data.current.condition.icon;
        const Humidity_data = data.current.humidity;

        result_Weather.innerHTML = `
            <div class="gap-4 p-2 items-center">
            <img src="https:${icon}" class="bg-neutral-200 backdrop-blur-lg border-0 rounded-2xl">
            <div class="p-2">
                <p class="p-2 text-white"> Temprature : ${temp} </p>
                <p class="p-2 text-white"> Humidity : ${Humidity_data} </p>
            </div>
            </div> `;
    }


    async function Crypto_Search(query_search) {
        if (!query_search) {
            ErrorAlert("Please enter Currency Symbol (BTC) ");
            return;
        }
        result_Crypto.innerHTML = `<p class="text-white"> Searching ... </p>`;
        const query_symbol = query_search.trim().toUpperCase();
        const apiKey = "lavmuxq54jd3d278rzff";
        const url = `https://api.freecryptoapi.com/v1/getData?symbol=${query_symbol}`;
        try {

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                store_error("Server is down / Search something valid");
            }

            const data = await response.json();
            if (!data.symbols || data.symbols.length === 0) {
                result_Crypto.innerHTML = `<p> Search Not Found </p>`;
                store_error(`search with correct query ( ${query_search} !! )`);
                return;
            }
            result_Crypto.className = "text-neutral/300";
            console.log("Full response ", data);
            const coin = data.symbols[0];
            const price = coin.last;
            const signal = data.status.toUpperCase() || "N/A";
            const change = coin.daily_change_percentage;
            result_Crypto.innerHTML = `
                <div class="gap-4 p-2">
                    <p class="p-2 text-white"> Price(USD) : $${price} </p>
                    <p class="p-2 text-white"> Change(Last 24H) : ${change} </p>
                    <p class="p-2 text-white"> Signal : ${signal} </p>
                </div>
            `;

        } catch (err) {
            console.log(err);
            result_Crypto.innerHTML = `<p class="text-red-300 text-xs"> Error : Please try again 1 minute `;
            store_error("Try again in 1 minute (Crypto API) ");
        }
    }


    function store_error(err_msg) {
        let all_error = JSON.parse(localStorage.getItem('error_history')) || [];
        const newEntry = `${err_msg}`;
        if (!Array.isArray(all_error)) {
            all_error = [];
        }
        if (!all_error.includes(newEntry)) {
            all_error.unshift(newEntry);
        }
        all_error = all_error.slice(0, 5);
        localStorage.setItem('error_history', JSON.stringify(all_error));
        display_Errors();
    }


    function display_Errors() {
        const error_div = document.getElementById('error_history_div');
        const recent_error = JSON.parse(localStorage.getItem('error_history')) || [];
        error_div.innerHTML = "";
        const errorList = Array.isArray(recent_error) ? recent_error : (recent_error ? [recent_error] : []);
        error_div.className = "px-4 py-5 flex flex-col gap-y-2";
        for (let ind = 0; ind < 5; ind++) {
            const chip = document.createElement('p');
            chip.innerText = " ~ " + errorList[ind];
            chip.className = "w-auto p-2 h-fit bg-red-500/10 border border-red-500/20 text-red-400 rounded-md";
            error_div.appendChild(chip);
        }

    }

    display_Errors();

    function closeDropDown() {
        document.getElementById('dropdown').classList.add('hidden');
    }




    window.addEventListener('click', function (event) {
        const dropdown = document.querySelector('#dropdown');
        const dropdownButton = document.querySelector('#selected_text');

        if (!dropdown.classList.contains('hidden')) {
            if (!dropdownButton.contains(event.target) && !dropdown.contains(event.target)) {
                dropdown.classList.add('hidden');
                dropdownButton.classList.add('text-center');
            }
        }
    });

    window.addEventListener('keydown', (e) => {
        if (e.key === "Enter" && document.getElementById('dropdown').classList.contains('hidden')) {
            search_query_btn.click();
        }
        else if (e.key === "Enter" && !document.getElementById('dropdown').classList.contains('hidden')) {
            count = 0;
            if (Github_dropdown.classList.contains('bg-indigo-300'))
                Github_dropdown.classList.remove('bg-indigo-300');
            if (Weather_dropdown.classList.contains('bg-indigo-300'))
                Weather_dropdown.classList.remove('bg-indigo-300');
            if (Crypto_dropdown.classList.contains('bg-indigo-300'))
                Crypto_dropdown.classList.remove('bg-indigo-300');
        }
        else if (e.key === "Escape")
            closeDropDown();
    })

    window.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });

    window.addEventListener('keydown', function (event) {
        if (event.keyCode == 32 || event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
        }
    });

    const dropdown_main = document.getElementById('selected_text');

    dropdown_main.addEventListener('click', () => {
        toggledropdown();
    })

    let count = 0;


    Github_dropdown.addEventListener('click', () => {
        selectOption(Github_dropdown.innerText);
    })

    Weather_dropdown.addEventListener('click', () => {
        selectOption(Weather_dropdown.innerText);
    })

    Crypto_dropdown.addEventListener('click', () => {
        selectOption(Crypto_dropdown.innerText);
    })


    function toggledropdown() {
        count = 0;
        const dropdown = document.querySelector('#dropdown');
        const btn = document.querySelector('#selected_text');
        dropdown.classList.toggle("hidden");

        if (!dropdown.classList.contains("hidden")) {
            btn.classList.add("bg-white", "text-neutral-700", "scale-[1.04]");
        }
        else {
            if (btn.getAttribute('data-selected') !== 'true') {
                btn.classList.remove("bg-white", "text-neutral-700", "scale-[1.04]");
            }
        }
    }

    function selectOption(option_value) {
        const btn = document.getElementById('selected_text');
        btn.innerText = option_value;
        btn.setAttribute('data-selected', 'true');
        btn.classList.add("flex", "justify-center", "items-center");
        document.querySelector('#dropdown').classList.add("hidden");
    }


    window.addEventListener('keydown', (event) => {
        const btn = document.getElementById('selected_text');
        if (event.key === "ArrowDown" && !btn.classList.contains('hidden')) {
            count++;
            if (Math.abs(count) % 3 == 1) {
                btn.innerText = "GitHub API";
                btn.classList.add('items-center', 'flex', 'justify-center');
                Github_dropdown.classList.add("bg-indigo-300");
                Weather_dropdown.classList.remove("bg-indigo-300");
                Crypto_dropdown.classList.remove("bg-indigo-300");
            }
            else if (Math.abs(count) % 3 == 2) {
                btn.classList.add('items-center', 'flex', 'justify-center');
                btn.innerText = "Weather API";
                Weather_dropdown.classList.add("bg-indigo-300");
                Crypto_dropdown.classList.remove("bg-indigo-300");
                Github_dropdown.classList.remove("bg-indigo-300");
            }
            else {
                btn.innerText = "Crypto API";
                btn.classList.add('items-center', 'flex', 'justify-center');
                Crypto_dropdown.classList.add("bg-indigo-300");
                Github_dropdown.classList.remove("bg-indigo-300");
                Weather_dropdown.classList.remove("bg-indigo-300");
            }
        }
    })


    window.addEventListener('keydown', (e) => {
        if (e.key === "F12") {
            e.preventDefault();
            const alertText = document.getElementById('error_alert_text');
            alertText.innerText = "Security Protocol : Developer tools access restricted ";
            alert_modal.classList.remove('hidden');
            alert_modal.classList.add('flex');
        }
    });

})
