import {ClosedPage} from "./ClosedPage.jsx";
import {Alert, Button, Spinner, Table} from "react-bootstrap";
import "../App.css"
import {Link} from "react-router-dom";
function Loading(props) {
    return (
        <Spinner className='m-2' animation="border" role="status" />
    )
}
function PagesTable(props){
    return(
      <div className="below-nav">
          {
            props.user?
                <Button onClick={()=>props.setBack()}>Go to the {props.back?"front office":"back office"}</Button> :undefined
          }
          {props.errorMsg?
              <Alert variant='danger' dismissible className='my-2' onClose={props.setErrorMsg}>
                  {props.errorMsg}
              </Alert> : null
          }
          {
              !props.dataDispondibili?<Loading/>:
          <Table>
              <thead>
                  <tr>
                      <th className="col-md-5">
                          TITOLO
                          <i className={props.orderedBy=="title" && props.orderType?"bi-sort-up":"bi-sort-down"} onClick={(evn) =>{props.orderedBy=="title"?props.setOrderType((old)=>!old):props.setOrderType(true);props.setOrderedBy("title");}}/>
                      </th>
                      <th className="col-md-2">
                          AUTORE
                          <i className={props.orderedBy=="author" && props.orderType?"bi-sort-up":"bi-sort-down"} onClick={(evn) =>{props.orderedBy=="author"?props.setOrderType((old)=>!old):props.setOrderType(true);props.setOrderedBy("author");}}/>
                      </th>
                      {
                          props.back && props.user?
                          <th className="col-md-2">
                              DATA CREAZIONE
                              <i className={props.orderedBy == "creationDate" && props.orderType ? "bi-sort-up" : "bi-sort-down"}
                                 onClick={(evn) => {
                                     props.orderedBy == "creationDate" ? props.setOrderType((old) => !old) : props.setOrderType(true);
                                     props.setOrderedBy("creationDate");
                                 }}/>
                          </th>:undefined
                      }
                      <th className="col-md-2">
                          DATA PUBBLICAZIONE
                          <i className={props.orderedBy=="publicationDate" && props.orderType?"bi-sort-up":"bi-sort-down"} onClick={(evn) =>{props.orderedBy=="publicationDate"?props.setOrderType((old)=>!old):props.setOrderType(true);props.setOrderedBy("publicationDate");}}/>
                      </th>
                      {
                          props.back && props.user?<th className="col-md-1"/>:undefined
                      }
                  </tr>
              </thead>
              <tbody id="TablePagesBody">
                  {
                      props.pages.map((e)=> {
                              return <ClosedPage setSearch={props.setSearch} back={props.back} dataDispondibili={props.dataDispondibili} deletePage={props.deletePage} key={"closed "+e.id} page={e} user={props.user} />;
                      })
                  }
              </tbody>
          </Table>
          }
          {
              props.user && props.back?
              <Link to='/add'>
                  <Button onClick={()=>props.setSearch(false)} variant="primary" size="lg" className="fixed-right-bottom"> + </Button>
              </Link>:undefined
          }
      </div>
    );
}

export {PagesTable};