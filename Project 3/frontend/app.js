const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address account) view returns (uint256)",
  "function transfer(address to, uint256 value) returns (bool)"
];

let provider;
let signer;
let account;
let token;

// Helper function to get HTML elements
const $ = (id) => document.getElementById(id);

// Display messages
function message(text) {
  $("message").textContent = text;
}

// Clear old transaction information
function clearTransactionLink() {
  $("txLink").textContent = "";
  $("txLink").removeAttribute("href");
}

// Connect wallet
async function connectWallet() {
  if (!window.ethereum) {
    message(
      "No injected wallet found. Please install MetaMask or another compatible wallet."
    );
    return;
  }

  try {
    provider = new ethers.BrowserProvider(window.ethereum);

    await provider.send("eth_requestAccounts", []);

    signer = await provider.getSigner();
    account = await signer.getAddress();

    $("account").textContent = account;
    $("walletStatus").textContent = "Wallet connected.";

    message("Wallet connected successfully.");
  } catch (error) {
    console.error(error);

    if (error.code === 4001) {
      message("Wallet connection was rejected.");
    } else {
      message("Could not connect to the wallet.");
    }
  }
}

// Load ERC-20 token contract
async function loadToken() {
  if (!signer) {
    message("Connect your wallet first.");
    return;
  }

  const address = $("tokenAddress").value.trim();

  if (!ethers.isAddress(address)) {
    message("Please enter a valid token contract address.");
    return;
  }

  try {
    token = new ethers.Contract(address, ERC20_ABI, signer);

    const [name, symbol, decimals, rawBalance] = await Promise.all([
      token.name(),
      token.symbol(),
      token.decimals(),
      token.balanceOf(account)
    ]);

    $("balance").textContent =
      `${ethers.formatUnits(rawBalance, decimals)} ${symbol}`;

    clearTransactionLink();

    message(`Loaded ${name} (${symbol}).`);
  } catch (error) {
    console.error(error);

    token = null;

    $("balance").textContent = "—";

    message(
      "Could not load the ERC-20 contract. Check the contract address and network."
    );
  }
}

// Refresh token balance
async function refreshBalance() {
  if (!token || !account) {
    return null;
  }

  const decimals = await token.decimals();
  const symbol = await token.symbol();
  const rawBalance = await token.balanceOf(account);

  $("balance").textContent =
    `${ethers.formatUnits(rawBalance, decimals)} ${symbol}`;

  return {
    decimals,
    symbol,
    rawBalance
  };
}

// Transfer tokens
async function transferTokens() {
  // Clear old transaction hash first
  clearTransactionLink();

  if (!signer || !token) {
    message("Connect your wallet and load the token contract first.");
    return;
  }

  const recipient = $("recipient").value.trim();
  const amountText = $("amount").value.trim();

  // Validate recipient address
  if (!ethers.isAddress(recipient)) {
    message("Invalid recipient address.");
    return;
  }

  // Prevent zero address
  if (recipient === ethers.ZeroAddress) {
    message("Recipient cannot be the zero address.");
    return;
  }

  // Validate amount
  if (!amountText || Number(amountText) <= 0) {
    message("Enter a token amount greater than zero.");
    return;
  }

  try {
    // Get latest balance
    const balanceData = await refreshBalance();

    if (!balanceData) {
      message("Unable to read token balance.");
      return;
    }

    const { decimals, rawBalance } = balanceData;

    // Convert entered amount into token's smallest unit
    const amount = ethers.parseUnits(amountText, decimals);

    // IMPORTANT:
    // Prevent transfer when balance is insufficient
    if (amount > rawBalance) {
      message("Insufficient token balance. Transfer cancelled.");
      clearTransactionLink();
      return;
    }

    message("Waiting for wallet confirmation...");

    // Send transaction
    const tx = await token.transfer(recipient, amount);

    message("Transaction submitted. Waiting for confirmation...");

    // Wait until transaction is mined
    await tx.wait();

    message("Transfer completed successfully.");

    // Show transaction hash only after successful transaction
    $("txLink").textContent = `Transaction hash: ${tx.hash}`;

    // For local Hardhat, there may not be a public explorer.
    // Keep the hash visible without forcing an external link.
    $("txLink").removeAttribute("href");

    // Refresh balance after successful transfer
    await refreshBalance();

    // Clear amount after successful transfer
    $("amount").value = "";

  } catch (error) {
    console.error(error);

    clearTransactionLink();

    if (error.code === 4001) {
      message("Transaction rejected in the wallet.");
    } else if (error.code === "ACTION_REJECTED") {
      message("Transaction rejected in the wallet.");
    } else {
      message(
        error.shortMessage ||
        error.reason ||
        "Transfer failed. Please check the wallet, network, balance, and recipient address."
      );
    }
  }
}

// Connect wallet button
$("connectBtn").addEventListener("click", connectWallet);

// Load token button
$("loadTokenBtn").addEventListener("click", loadToken);

// Transfer button
$("transferBtn").addEventListener("click", transferTokens);

// Automatically refresh account if MetaMask account changes
if (window.ethereum) {
  window.ethereum.on("accountsChanged", async (accounts) => {
    if (accounts.length === 0) {
      account = null;
      signer = null;

      $("account").textContent = "—";
      $("balance").textContent = "—";
      $("walletStatus").textContent = "Wallet not connected.";

      clearTransactionLink();
      message("Wallet disconnected.");
      return;
    }

    try {
      provider = new ethers.BrowserProvider(window.ethereum);
      signer = await provider.getSigner();
      account = accounts[0];

      $("account").textContent = account;

      if (token) {
        await refreshBalance();
      }

      message("Wallet account changed.");
    } catch (error) {
      console.error(error);
      message("Could not update the connected wallet.");
    }
  });

  // Handle network changes
  window.ethereum.on("chainChanged", () => {
    window.location.reload();
  });
}