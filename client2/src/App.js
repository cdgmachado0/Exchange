import './App.scss';

function App() {
  return (
    <div class="components">
      <div class="wallet">
        <h1> Your Wallet </h1>
        <input type="text" id="exchange-address" placeholder="Your Address" />
        {/* <select id="exchange-address"></select> */}
        <div id="balance">
          0
        </div>
      </div>

      <div class="send">
        <h1> Send Amount </h1>
        <input type="text" id="send-amount" placeholder="Send Amount" />
        <input type="text" id="private-key" placeholder="Private Key" />
        <input type="text" id="recipient" placeholder="Recipient" />
        <div class="button" id="transfer-amount">
          Transfer Amount
        </div>
      </div>
    </div>
  );
}

export default App;
