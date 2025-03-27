import dayjs from "dayjs";
import {Button} from "react-bootstrap";
import {useNavigate} from "react-router-dom";

function ClosedPage(props){
    let {page} = props;

    let statusClass = null;

    switch(page.status) {
        case 'added':
            statusClass = 'table-success';
            break;
        case 'deleted':
            statusClass = 'table-danger';
            break;
        case 'updated':
            statusClass = 'table-warning';
            break;
        default:
            break;
    }

    const navigate=useNavigate();
    return(
        <tr className={statusClass} id={page.id} onClick={()=>{props.setSearch(false);navigate("/openedPage/"+page.id)}}>
            <td>{page.title}</td>
            <td>{page.author}</td>
            {props.back && props.user ?<td>{page.creationDate.format("DD-MM-YYYY")}</td>:undefined}
            <td>
                {page.publicationDate?page.publicationDate.diff(dayjs())>0?
                    <p className="text-success">
                        {page.publicationDate.format("DD-MM-YYYY")}
                    </p>:
                    page.publicationDate.format("DD-MM-YYYY"):"Draft"
                }
            </td>
            {
                props.back && props.user && (props.user.administrator || props.user.username == props.page.author)?
                <td className="position-sticky start-100" >
                    <Button onClick={(e)=>{e.stopPropagation(); props.setSearch(false); navigate("/modify/"+page.id)}}>
                        <i className="bi-pencil-square"></i>
                    </Button >
                    <Button variant="danger" onClick={(e)=>{e.stopPropagation(); props.deletePage(page.id)}}>
                        <i className="bi-trash"></i>
                    </Button>
                </td>:props.back && props.user?<td/>:undefined

            }
        </tr>
    );
}

export {ClosedPage};