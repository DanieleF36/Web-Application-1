import {Button, Card, Col, Row} from "react-bootstrap";
import {Header, Image} from "../Models/Pages.js";
import {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import API from "../API.jsx";
import dayjs from "dayjs";

function OpenedPage(props){
    const [page, setPage] = useState({title: "", author: "",creationDate:dayjs(), publicationDate:dayjs(), order: []});
    const {pageId} = useParams();
    useEffect(() =>{
        API.getOpenedPage(pageId).then(p => setPage(p));
    },[]);
    const navigate = useNavigate();
    return(
                <Card className="alert-below-nav">
                    <Card.Header>
                        <Card.Title>
                            {page.title}
                            <Button key="closeButton" className="position-sticky start-100" size="sm" variant="danger" onClick={()=>{props.setSearch(true);navigate("/")}}>X</Button>
                        </Card.Title>
                        <Card.Subtitle>{page.author}</Card.Subtitle>
                    </Card.Header>
                    <Card.Body>

                        {
                                page.order.map((el, index)=>{
                                    if(el instanceof Image) {
                                        return <Row key={index} className="justify-content-center mt-1">
                                            <Card.Img key={"image" + index} src={"http://localhost:3001"+el.url} className="w-50"/>
                                        </Row>
                                    }
                                    else if(el instanceof Header){
                                        return <h2 key={"header "+index}>{el.header}</h2>
                                    }else
                                        return <Row className="pt-1" key={"paragraph "+index}><Card.Text key={"text"+index}>{el.text}</Card.Text></Row>
                                })
                            }
                    </Card.Body>
                    <Card.Footer>
                        <Row key="footer">
                            {
                                props.back && props.user?
                                    <Col sm={5}>{"Data Creazione: "+page.creationDate.format("DD-MM-YYYY")}</Col>
                                :undefined
                            }
                            {
                                props.user?
                                    page.publicationDate!=""?
                                        <Col sm={6}>{"Data Pubblicazione: "+page.publicationDate.format("DD-MM-YYYY")}</Col>:
                                        <Col sm={6}>{"Data Pubblicazione: non ancora pubblicato"}</Col>
                                    :<Col sm={11}>{"Data Pubblicazione: "+page.publicationDate.format("DD-MM-YYYY")}</Col>
                            }
                            {
                                props.back && props.user && (props.user.administrator || props.user.username == page.author)?
                                    <Col>
                                        <Button key="modify" onClick={()=>navigate("/modify/"+pageId)}>
                                            <i className="bi-pencil-square"></i>
                                        </Button>
                                        <Button key="delete" variant="danger" onClick={()=>{props.setSearch(true);props.deletePage(pageId); navigate("/")}}>
                                            <i className="bi-trash"></i>
                                        </Button>
                                    </Col>:undefined
                            }
                        </Row>
                    </Card.Footer>
                </Card>
    );
}

export {OpenedPage};