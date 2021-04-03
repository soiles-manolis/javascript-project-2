"use strict";

let prevQuery = 'javascript';
let perPage = 10;
let currentPage = 1;
let arrayId = [];
let total;

//check localStorage with from refresh page
if (localStorage.getItem('key')) {
    arrayId = localStorage.getItem('key').split(',');
}

//searching data
let fetchImages = async (query, page, per_page) => {
    window.scroll(0, 0);
    prevQuery = query;
    currentPage = page;
    let url = `https://api.unsplash.com/search/photos?query=${query}&page=${page}&per_page=${per_page}`;
    let response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Client-ID ${API_KEY}`
        }
    });
    response = await response.json();
    total = response.total;
    createCard(response.results);

}
//display data the html page
let createCard = (requestResults) => {
    let html = '';
    requestResults.forEach((item) => {

        let date = new Date(item.updated_at);
        let minutesFormated;
        if (date.getMinutes() < 10) {
            minutesFormated = `0${date.getMinutes()}`;
        }
        else if ((date.getMinutes() % 10) == 0) {
            minutesFormated = `${date.getMinutes()}0`;
        }
        else {
            minutesFormated = date.getMinutes();
        }
        let updatedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${minutesFormated}:${date.getSeconds() < 10 ? date.getSeconds() + "0" : date.getSeconds()} `;
        html += `<div class="col-md" style="width:10rem; height: 35rem;"><div class="card" >
        <img src="${item.urls.regular}" class="card-img-top " alt="${item.urls.regular}">
        <div class="card-body">
        <img src="${item.user.profile_image.medium}" alt="${item.user.profile_image.medium}" width="30" height="24" class="d-inline-block align-top">
        <span>${item.user.first_name ? item.user.first_name : ''}</span> <span>${item.user.last_name ? item.user.last_name : ''}</span>
        </div>
        <ul class="list-group list-group-flush">
        <li class="list-group-item">${item.user.instagram_username}</li>
        <li class="list-group-item">${item.likes}</li>
        <li class="list-group-item">${updatedDate}</li>
        </ul>
            <div class="card-body">
            ${modifHtml(item.id)}
            </div>
        </div></div>`
    })
    document.querySelector('#cards').innerHTML = html;
    cardEvents();
    pagination(total);
}
//add event listeners from all cards
let cardEvents = () => {
    document.querySelectorAll('.card-link').forEach((el) => {
        el.addEventListener('click', () => {
            let id = el.getAttribute('data-id');
            if (!localStorage.getItem('key') || !localStorage.getItem('key').includes(id)) {
                arrayId.push(id);
                localStorage.setItem('key', arrayId.toString());  //convert array to string
                el.classList.add('modClass');
                el.innerHTML = "delete from my favorites";
                console.log(localStorage.getItem('key'));
            } 
            else {
                let deleteItem = arrayId.filter((item) => item != id);
                localStorage.setItem('key', deleteItem.toString());
                arrayId = localStorage.getItem('key').split(','); //convert string to string array 
                el.classList.remove('modClass');
                el.innerHTML = "add my favorites";
                if (localStorage.getItem('key') == "") {
                    arrayId = [];
                    localStorage.removeItem('key');
                }
            }
        })
    })
}
//change style the data which added the localStorage
let modifElement;
let modifHtml = (id) => {
    if (localStorage.getItem('key') && localStorage.getItem('key').includes(id)) {
        modifElement = `<a href="javascript:;" class="card-link modClass" data-id="${id}">delete from my favorites</a>`;
    }
    else {
        modifElement = `<a href="javascript:;" class="card-link" data-id="${id}">add my favorites</a>`;
    }
    return modifElement;
}
//select images per page
let perPageDD = (numberImages) => {
    document.querySelector('#perPage').innerHTML = numberImages;
    perPage = numberImages;
}
//pagination
let pagination = (total) => {
    let previousBtn;
    let nextBtn;
    let pages = [];
    for (let i = 1; i <= total; i++) {
        if (i == 1) {
            pages.push(i);
        }
        if (i > currentPage - 3 && i < currentPage + 3 && i > 1 && i < total) {
            pages.push(i);
        }
        if (i == total) {
            pages.push(i);
        }
    }
    let html = `<nav aria-label="Page navigation example">
    <ul class="pagination justify-content-center">
        <li class="page-item" id="previousButton">
            <a class="page-link" href="#" tabindex="-1">Previous</a>     
        </li>`;
    pages.forEach((p, index) => {
        html += `<li class="page-item ${currentPage == p ? 'active' : ''}"><a id="paginationEvent" class="page-link" data-page=${p} href="javascript:;">${p}</a></li>`;
        if (index == 0 && pages[index + 1] - pages[index] > 1) {
            html += `<li class="page-item"><p class="page-link">...</p></li>`;
        }
        if (index == pages.length - 2 && pages[index + 1] - pages[index] > 1) {
            html += `<li class="page-item"><p class="page-link">...</p></li>`;
        }
    })
    html += `<li class="page-item" id="nextButton">
    <a class="page-link" href="#">Next</a></li></ul></nav>`;

    document.querySelector('#paginationComponent').innerHTML = html;
  
    nextBtn = document.querySelector('#nextButton').classList;
    previousBtn = document.querySelector('#previousButton').classList;  

    currentPage == 1 ? previousBtn.add('disabled') : previousBtn.remove('disabled');
    currentPage == total ? nextBtn.add('disabled') : nextBtn.remove('disabled');

    document.querySelectorAll('#paginationEvent').forEach((el) => {
        el.addEventListener('click', () => {
            let numberPage = parseInt(el.getAttribute('data-page'));
            fetchImages(prevQuery, numberPage, perPage);
        })
    })
    document.querySelector('#previousButton').addEventListener('click', () => {
        let previousPage = currentPage-1;
        fetchImages(prevQuery,previousPage, perPage);    
    })
    document.querySelector('#nextButton').addEventListener('click', function(){
        let nextPage=currentPage+1;
        fetchImages(prevQuery,nextPage, perPage);
    })
}
// keydown Enter event
document.querySelector('#inputText').addEventListener('keydown', function (e) {
    if (e.keyCode == 13) {
        currentPage = 1;
        fetchImages(this.value, currentPage, perPage);
    }
});
//click event
document.querySelector('#searchButton').addEventListener('click', () => {
    let textInput = document.querySelector('#inputText').value;
    currentPage = 1;
    fetchImages(textInput, currentPage, perPage);
});

//When the page will open
fetchImages('javascript', currentPage, perPage);