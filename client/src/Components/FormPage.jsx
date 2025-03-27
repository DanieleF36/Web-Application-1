import {Alert, Button, Image as ReactImage, Col, Form, Row} from "react-bootstrap";
import {useEffect, useState} from "react";
import {Header, Image, Pages, Paragraph} from "../Models/Pages.js";
import {useNavigate, useParams} from "react-router-dom";
import API from "../API.jsx";
import dayjs from "dayjs";

function FormPage(props){
    let {pageId} = useParams();
    const [title, setTitle] = useState("");
    const [publicationDate, setPublicationDate] = useState("");
    const [author, setAuthor] = useState(!pageId && props.user.administrator?props.user.username:"");
    const [authorId, setAuthorId] = useState(-1);
    const [creationDate, setCreationDate] = useState("");
    const [body, setBody] = useState([]);

    const [errTitle, setErrTitle] = useState("bg-transparent");
    const [errPublicationDate, setErrPublicationDate] = useState("bg-transparent");
    const [errBlocks, setErrBlocks] = useState([]);

    const [errMsg, setErrMsg] = useState("");

    const[addImages, setAddImages] = useState(false);
    const[images, setImages] = useState([]);

    useEffect(() =>{
        if(pageId)
            API.getOpenedPage(pageId).then((p) =>{
                setTitle(p.title);
                setPublicationDate(p.publicationDate==""?"":p.publicationDate.format("YYYY-MM-DD"));
                setAuthor(p.author);
                setAuthorId(p.authorId);
                setCreationDate(p.creationDate.format("YYYY-MM-DD"));
                setBody(p.order);
                setErrBlocks(new Array(p.order.length).fill("bg-transparent"))
            });
        API.getImages().then((i)=>setImages(i));
    },[]);

    const navigate = useNavigate();

    const moveUp = (index)=>{
        if(index!=0) {
            let a = [...body];
            [a[index - 1], a[index]] = [a[index], a[index - 1]];
            a[index - 1].pos--;
            a[index].pos++;
            setBody([...a]);
        }
    }

    const moveDown = (index)=>{
        if(index!=body.length-1) {
            let a = [...body];
            [a[index + 1], a[index]] = [a[index], a[index + 1]];
            a[index + 1].pos++;
            a[index].pos--;

            setBody([...a]);
        }
    }

    const del = (index) => {
        let a = [...body];
        a = a.filter((el)=>el.pos!=index);
        a = a.map((el, i) =>{
            if(i<index)
                return el;
            else{
                el.pos--;
                return el;
            }
        })
        setBody([...a]);
    }

    const handleSubmit = (ev)=>{
        ev.preventDefault();
        let bg = "bg-warning";

        let ok = true;
        if(title == "") {
            setErrTitle(bg);
            setErrMsg("Titolo sbagliato");
            ok = false;
        }
        if(publicationDate!="" && (pageId==undefined && dayjs(publicationDate).diff(dayjs(), "day")<0)){
            setErrPublicationDate(bg);
            setErrMsg("La data di pubblicazione non può essere precedente ad oggi");
            ok = false;
        }
        let h=0, b=0;
        for(let v of body){
            if (v instanceof Header) {
                h++;
                if(v.header==undefined || v.header=="") {
                    setErrBlocks((old)=>{
                        return old.map((el, i)=>{
                            if(v.pos==i) {
                                return bg;
                            }
                            else {
                                return el;
                            }
                        })
                    })
                    setErrMsg("Uno dei campi è vuoto");
                    ok = false;
                }
            }
            else {
                b++;
                if(v instanceof Paragraph && (v.text==undefined || v.text=="")) {
                    setErrBlocks((old)=>{
                        return old.map((el, i)=>{
                            if(v.pos==i) {
                                return bg;
                            }
                            else
                                return el;
                        })
                    })
                    setErrMsg("Uno dei campi è vuoto");
                    ok = false;
                }
            }
        }
        if(h<1 || b<1){
            setErrMsg("Numero di blocchi sbagliati");
            ok = false;
        }
        if(ok) {
            let page = new Pages(pageId, title, pageId?author:undefined, pageId?authorId:-1,pageId?creationDate:dayjs().format("YYYY-MM-DD"), publicationDate==""?undefined:publicationDate);
            page.order = body;
            if(pageId) {
                props.update(page);
            }
            else {
                if (props.user.administrator)
                     page.author = author;
                props.addPage(page);
            }
            props.setSearch(true);
            navigate("/");
        }
    };

    const handleParagraph = () => {
        setBody([...body, new Paragraph("", body.length)]);
        setErrBlocks([...errBlocks, "bg-transparent"]);
    }

    const handleImageSelection = (index) => {
        const img = new Image(images[index].url, body.length, images[index].id);
        setBody((old) => {return [...old, img]});
        setAddImages(false);
        setErrBlocks([...errBlocks, "bg-transparent"]);
    }

    const handleHeader = ()=>{
        setBody([...body, new Header("", body.length)]);
        setErrBlocks([...errBlocks, "bg-transparent"]);
    }

    return(
        <>
            {errMsg? <Alert className="alert-below-nav" variant='danger' onClose={()=>setErrMsg('')} dismissible>{errMsg}</Alert> : false }
            <Form onSubmit={(ev)=>handleSubmit(ev)} className={errMsg?"":"below-nav"}>
                <Form.Group>
                    <Form.Label>Title</Form.Label>
                    <Form.Control className={errTitle} type="text" name="text" value={title} onChange={ev => setTitle(ev.target.value)} />
                </Form.Group>
                {
                    props.user.administrator?
                        <Form.Group>
                            <Form.Label>Autore</Form.Label>
                            <Form.Control type="text" name="text" value={author} onChange={ev => setAuthor(ev.target.value)}/>
                        </Form.Group>:
                        undefined
                }
                <Form.Group>
                    <Form.Label>Data Pubblicazione</Form.Label>
                    <Form.Control className={errPublicationDate} type="date" name="date" value={publicationDate} onChange={ev => setPublicationDate(ev.target.value)} />
                </Form.Group>
            {
                body.map((el, index, array)=>{
                    return (
                        <Row className="py-2" key={index}>
                            <Col xs={10}>
                                {
                                    el instanceof Image ?
                                        <ReactImage src={"http://localhost:3001"+el.url} className="w-50"/> :
                                        el instanceof Paragraph?
                                        <>
                                            <Form.Group>
                                                <Form.Label>Paragraph</Form.Label>
                                                <Form.Control className={errBlocks[index]} type="text" name="text" value={el.text} onChange={ev => setBody((old)=>{
                                                                                                                                                                    return old.map((el, i) => {
                                                                                                                                                                        if(i != index)
                                                                                                                                                                            return el;
                                                                                                                                                                        else
                                                                                                                                                                            return new Paragraph(ev.target.value, el.pos);
                                                                                                                                                                    })
                                                                                                                                                                })}/>
                                            </Form.Group>
                                        </>:
                                            <Form.Group>
                                                <Form.Label>Header</Form.Label>
                                                <Form.Control className={errBlocks[index]} type="text" name="text" value={el.header} onChange={ev => setBody((old)=>{
                                                                                                                                                                    return old.map((el, i) => {
                                                                                                                                                                        if(i != index)
                                                                                                                                                                            return el;
                                                                                                                                                                        else
                                                                                                                                                                            return new Header(ev.target.value, el.pos);
                                                                                                                                                                    })
                                                                                                                                                                })}/>
                                            </Form.Group>
                                }
                            </Col>
                            <Col xs={2} className="d-flex align-items-md-center">
                                <Button variant="danger" onClick={()=>del(index)}>
                                    <i className="bi-trash"></i>
                                </Button>
                                {
                                    array.length>1 && index!=0?
                                    <Button onClick={()=>moveUp(index)}>
                                        <i className="bi-arrow-up-circle"></i>
                                    </Button>:undefined
                                }
                                {
                                    array.length>1 && index!=array.length-1?
                                    <Button onClick={()=>moveDown(index)}>
                                        <i className="bi-arrow-down-circle"></i>
                                    </Button>:undefined
                                }
                            </Col>
                        </Row>
                    );
                })
            }
            {
                addImages?
                    <>
                        <Button key="closeButton" className="position-sticky start-100" size="sm" variant="danger" onClick={()=>setAddImages(false)}>X</Button>
                        <Row key="rowAddImage">
                            {
                                images.map((el, index) => {
                                    return <ReactImage key={"ImagePiker"+index} onClick={() => handleImageSelection(index)} src={"http://localhost:3001"+el.url} className="w-25"/>;
                                })
                            }
                        </Row>
                    </>: undefined
            }
            {
                !addImages?
                <Row key="addNewBlock" className="justify-content-center">
                    <Col xs={4}>
                        <Button onClick={()=>setAddImages(true)}>Add Image</Button>
                        <Button onClick={()=>handleParagraph()}>Add Paragraph</Button>
                        <Button onClick={()=>handleHeader()}>Add Header</Button>
                    </Col>
                </Row>:undefined
            }
            <Row key="exitForm" className="justify-content-center mt-2">
                <Col xs={3}>
                    <Button type="submit">Save {pageId?"Update":"Page"}</Button>
                    <Button variant="danger" onClick={()=>{props.setSearch(true);navigate("/")}}>Close {pageId?"Update":"Page"}</Button>
                </Col>
            </Row>
            </Form>
        </>
    );
}

export {FormPage};
