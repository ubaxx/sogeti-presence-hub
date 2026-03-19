import { useState } from "react";

type Props = {
  onSelect: () => void;
};

export default function PresencePopup({ onSelect }: Props) {

  const [open, setOpen] = useState(true);

  if (!open) return null;

  function choose() {

    onSelect();
    setOpen(false);

  }

  return (

    <div className="presence-modal">

      <div className="presence-modal-card">

        <h3>Where are you working today?</h3>

        <div className="presence-buttons">

          <button onClick={choose}>
            Office
          </button>

          <button onClick={choose}>
            Remote
          </button>

          <button onClick={choose}>
            Client
          </button>

        </div>

      </div>

    </div>

  );

}