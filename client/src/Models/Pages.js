"use strict";
function Pages(id, title, author, authorId, creationDate, publicationDate){
    this.id = id;
    this.title = title;
    this.author = author;
    this.authorId = authorId;
    this.creationDate = creationDate;
    this.publicationDate = publicationDate;
    //blocks
    this.order = [];

    this.addImage = (image)=>{
        this.order.push(image);

    }

    this.addParagraph = (paragraph)=>{
        this.order.push(paragraph);
    }

    this.addHeader = (header)=>{
        this.order.push(header);
    }
}

function Image(url, pos, id){
    this.id = id;
    this.pos=pos;
    this.url = url;
}

function Paragraph(txt, pos){
    this.text=txt;
    this.pos=pos;
}

function Header(header, pos){
    this.header = header;
    this.pos = pos;
}

export {Pages, Image, Paragraph, Header};