import { usePresence } from "../hooks/usePresence";
import PresenceList from "../components/PresenceList";
import "../styles/teams.css";

export default function Home() {

  const { users } = usePresence();

  return (

    <div className="main-page">

      <h1 className="page-title">
        Presence Overview
      </h1>

      <PresenceList users={users} />

    </div>

  );

}