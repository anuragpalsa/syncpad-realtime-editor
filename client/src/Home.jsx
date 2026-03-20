import { v4 as uuidV4 } from "uuid";
import { useNavigate } from "react-router-dom";

function Home() {
    const navigate = useNavigate();

    const createNewDoc = () => {
        const id = uuidV4();
        navigate(`/doc/${id}`);
};

return <button onClick = {createNewDoc}> new Document </button>
}

export default Home ;