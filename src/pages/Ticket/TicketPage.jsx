import useAuth from "../../hooks/useAuth";
import TicketInbox from "../../components/Ticket/TicketInbox";
import styles from "./TicketPage.module.css";

const TicketsPage = () => {
  const { token } = useAuth();

  return (
    <div className={styles.page}>
      <TicketInbox token={token} />
    </div>
  );
};

export default TicketsPage;
