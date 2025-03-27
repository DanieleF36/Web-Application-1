import dayjs from "dayjs";
import {Pages, Paragraph, Image, Header} from "./Models/Pages.js";

const URL = 'http://localhost:3001/api/';

async function getAllPublishedPages(){
    const res = await fetch(URL+"pages");
    const pages = await res.json();
    if (res.ok) {
        return pages.map((e) => (new Pages(e.id, e.title,e.author, -1, undefined, dayjs(e.publicationDate))));
    } else {
        throw pages;
    }
}

async function getAllPages(){
    const res = await fetch(URL+"auth/pages",{
        credentials: 'include',
    });
    const pages = await res.json();
    if (res.ok) {
        return pages.map((e) => (new Pages(e.id, e.title, e.author, -1, dayjs(e.creationDate), e.publicationDate?dayjs(e.publicationDate):"" )));
    } else {
        throw pages;
    }
}

async function getOpenedPage(id){
    const res = await fetch(URL+"pages/"+id);
    const  page = await res.json();
    if(res.ok){
        let p = new Pages(page.id, page.title, page.author,-1, dayjs(page.creationDate), page.publicationDate?dayjs(page.publicationDate):"");
        page.order.map((e)=>{
            if(e.text){
                p.addParagraph(new Paragraph(e.text, e.pos));
            }
            else if(e.header){
                p.addHeader(new Header(e.header, e.pos))
            }
            else{
                p.addImage(new Image(e.url, e.pos, e.id));
            }
        })
        return p;
    }
    else {
        throw page;
    }
}

async function getImages(){
    const res = await fetch(URL+"auth/images", {
        credentials: 'include',
    });
    const images = await res.json();
    if(res.ok){
        return images.map((el) => {
            return {
                id: el.id,
                url: el.url
            }
        });
    }
    else {
        throw images;
    }
}

async function deletePage(id){
    await fetch(URL+`auth/pages/`+id, {
            method: 'DELETE',
            credentials: 'include',
        }).then((response) => {
            if (response.ok) {
                return true;
            } else {
                response.json()
                    .then((message) => { throw message; })
                    .catch(() => { throw { error: "Cannot parse server response." } });
            }
        }).catch(() => { throw { error: "Cannot communicate with the server." } });
}

async function updatePage(page) {
    const res = await fetch(URL+"auth/pages/"+page.id,  {
        method: 'PUT',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(page),
    });
    const ret = await res.json();
    if(res.ok){
        return true;
    }
    else {
        throw ret;
    }
}

async function addPage(page){
    const res = await fetch(URL+`auth/pages`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(page),
    });
    const ret = await res.json();
    if(res.ok)
        return ret;
    else
        throw ret;
}

async function changeTitle(title) {
    const res = await fetch(URL+"auth/title",  {
        method: 'PUT',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({title: title}),
    });
    if(res.ok){
        return true;
    }
    else {
        throw {err:"impossible to update"};
    }
}

async function getTitle(){
    const res = await fetch(URL+"title");
    const title = await res.json();
    if(res.ok){
        return title;
    }
    else {
        throw title;
    }
}

/** ***************************************************************************************************************************************** **/
async function logIn(credentials) {
    let response = await fetch(URL + 'sessions', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
    });
    if (response.ok) {
        const user = await response.json();
        return user;
    } else {
        const errDetail = await response.json();
        throw errDetail.message;
    }
}

async function logOut() {
    await fetch(URL+'sessions/current', {
        method: 'DELETE',
        credentials: 'include'
    });
}

async function getUserInfo() {
    const response = await fetch(URL+'sessions/current', {
        credentials: 'include'
    });
    const userInfo = await response.json();
    if (response.ok) {
        return userInfo;
    } else {
        throw userInfo;
    }
}

const API = {getAllPublishedPages, getAllPages, getOpenedPage, getUserInfo, logIn, logOut, getImages, updatePage, deletePage,addPage, changeTitle, getTitle};

export default API;