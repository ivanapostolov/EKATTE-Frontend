const getDistinctCityNames = () => {
    const url = 'http://localhost:3000/api/all-distinct-town-names/';

    return new Promise((resolve, reject) => {
        fetch(url, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
            },
        }).then(response => {
            return response.json();
        }).then(data => {
            resolve(data.result);
        });
    });
}

getDistinctCityNames().then(data => {
    autocomplete(document.getElementById('search_input'), data.map(object => object.name));
});

const autocomplete = (input, list) => {
    let currentFocus;

    input.addEventListener("input", (e) => {
        let val = e.target.value;

        closeAllLists();

        if (!val) { return false; }

        currentFocus = -1;

        let listDIV = document.createElement("DIV");
        listDIV.setAttribute("id", e.target.id + "autocomplete-list");
        listDIV.setAttribute("class", "autocomplete-items");

        document.getElementById("content").appendChild(listDIV);

        let option;

        for (let i = 0; i < list.length; i++) {
            if (list[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
                option = document.createElement("DIV");

                option.innerHTML = "<strong>" + list[i].substr(0, val.length) + "</strong>" + list[i].substr(val.length) + "<input type='hidden' value='" + list[i] + "'>";

                option.addEventListener("click", (e) => {
                    input.value = e.target.getElementsByTagName("input")[0].value;
                    closeAllLists();
                });

                listDIV.appendChild(option);
            }
        }
    });

    input.addEventListener("keydown", (e) => {
        let listDIV = document.getElementById(e.target.id + "autocomplete-list");

        if (listDIV) {
            listDIV = listDIV.getElementsByTagName("div");
        }
        if (e.keyCode == 40) {
            currentFocus++;
            addActive(listDIV);
        } else if (e.keyCode == 38) {
            currentFocus--;
            addActive(listDIV);
        } else if (e.keyCode == 13) {
            e.preventDefault();

            if (currentFocus > -1) {
                if (listDIV) {
                    listDIV[currentFocus].click();
                }
            }
        }
    });

    const addActive = (options) => {
        if (!options) { return false; }

        removeActive(options);

        if (currentFocus >= options.length) {
            currentFocus = 0;
        }
        if (currentFocus < 0) {
            currentFocus = (options.length - 1);
        }

        options[currentFocus].classList.add("autocomplete-active");
    }

    const removeActive = (options) => {
        for (let i = 0; i < options.length; i++) {
            options[i].classList.remove("autocomplete-active");
        }
    }

    const closeAllLists = (elmnt) => {
        let x = document.getElementsByClassName("autocomplete-items");

        for (let i = 0; i < x.length; i++) {
            if (elmnt != x[i] && elmnt != input) {
                x[i].parentNode.removeChild(x[i]);
            }
        }
    }

    document.addEventListener("click", (e) => {
        closeAllLists(e.target);
    });
}

const addNewResult = (record) => {
    const div = document.createElement("DIV");
    div.innerText = record;
    div.setAttribute("class", "result-box");
    document.getElementById("content").appendChild(div);
}

const requestTown = (name) => {
    const url = 'http://localhost:3000/api/get-town-by-name/' + name;

    return new Promise((resolve, reject) => {
        fetch(url).then(response => {
            return response.json();
        }).then(data => {
            resolve(data.result);
        }).catch(err => {
            reject(err);
        });
    });
}

const requestMunicipality = (code) => {
    const url = 'http://localhost:3000/api/get-municipality-by-code/' + code;

    return new Promise((resolve, reject) => {
        fetch(url).then(response => {
            return response.json();
        }).then(data => {
            resolve(data.result);
        }).catch(err => {
            reject(err);
        });
    });
}

const requestProvince = (code) => {
    const url = 'http://localhost:3000/api/get-province-by-code/' + code;

    return new Promise((resolve, reject) => {
        fetch(url).then(response => {
            return response.json();
        }).then(data => {
            resolve(data.result);
        }).catch(err => {
            reject(err);
        });
    });
}

const handleRequest = async() => {
    const name = document.getElementById('search_input').value;

    if (name) {
        const results = await requestTown(name);

        results.forEach(e => {
            let record = `${e.kind === 1 ? 'град' : 'село'} ${e.name} > `;

            requestMunicipality(e.municipality_code).then(res => {
                record += `община ${res[0].name} > `;
                return requestProvince(res[0].province_code);
            }).then(res => {
                record += `област ${res[0].name}`;
                addNewResult(record);
            }).catch(err => {
                console.log(err);
            });
        });
    }
}

window.onload = () => {
    document.getElementById("search_btn").addEventListener('click', () => {
        let previousResults = document.getElementsByClassName('result-box');
        let parentNode = document.getElementById('content');

        for (let i = 0; i < previousResults.length; i++) {
            parentNode.removeChild(previousResults[i]);
        }

        handleRequest();
    });
}