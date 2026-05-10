import { useParams } from "react-router-dom";
import ShowtimesPage from "../pages/client/ShowtimesPage";

const ShowtimesPageRoute = () => {
    const { slug = "", province, day } = useParams<{
        slug: string;
        province?: string;
        day?: string;
    }>();

    return <ShowtimesPage key={slug} slug={slug} province={province} day={day} />;
};

export default ShowtimesPageRoute;
