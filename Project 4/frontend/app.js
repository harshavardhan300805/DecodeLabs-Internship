const ABI = [
  "function mintNFT(string metadataURI) returns (uint256)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function name() view returns (string)",
  "function symbol() view returns (string)"
];

let provider;
let signer;
let account;
let nft;

const $ = (id) => document.getElementById(id);

function setMessage(text) {
  $("message").textContent = text;
}

function clearResult() {
  $("result").classList.add("hidden");
  $("tokenId").textContent = "—";
  $("owner").textContent = "—";
  $("tokenURI").textContent = "—";
  $("metadataName").textContent = "—";
  $("metadataDescription").textContent = "—";
  $("metadataImage").textContent = "—";
  $("txHash").textContent = "";
}

async function connectWallet() {
  if (!window.ethereum) {
    setMessage("MetaMask was not detected. Install a compatible browser wallet.");
    return;
  }

  try {
    provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = await provider.getSigner();
    account = await signer.getAddress();

    $("account").textContent = account;
    $("walletStatus").textContent = "Wallet connected.";
    setMessage("Wallet connected successfully.");
  } catch (error) {
    console.error(error);
    setMessage(error.code === 4001
      ? "Wallet connection was rejected."
      : "Could not connect to the wallet.");
  }
}

async function loadContract() {
  if (!signer) {
    setMessage("Connect your wallet first.");
    return;
  }

  const address = $("contractAddress").value.trim();

  if (!ethers.isAddress(address)) {
    setMessage("Enter a valid NFT contract address.");
    return;
  }

  try {
    nft = new ethers.Contract(address, ABI, signer);

    const [name, symbol] = await Promise.all([
      nft.name(),
      nft.symbol()
    ]);

    $("contractStatus").textContent = `${name} (${symbol})`;
    clearResult();
    setMessage("NFT contract loaded successfully.");
  } catch (error) {
    console.error(error);
    nft = null;
    $("contractStatus").textContent = "Not loaded";
    setMessage("Could not load the contract. Check the address and network.");
  }
}

async function getMintedTokenId(receipt) {
  const iface = new ethers.Interface(ABI);

  for (const log of receipt.logs) {
    try {
      const parsed = iface.parseLog(log);
      if (parsed && parsed.name === "Transfer") {
        // The Transfer event is inherited from ERC-721 and is not in the
        // minimal ABI above, so this branch is only a fallback.
      }
    } catch (_) {}
  }

  // Project4NFT starts at token ID 1. After minting, the nextTokenId value
  // is not included in the minimal ABI, so infer the newly minted ID from
  // the receipt's ERC-721 Transfer event topic.
  const transferTopic = ethers.id("Transfer(address,address,uint256)");

  for (const log of receipt.logs) {
    if (log.topics && log.topics[0] === transferTopic && log.topics.length === 4) {
      return ethers.toBigInt(log.topics[3]);
    }
  }

  throw new Error("Could not determine the minted token ID.");
}

async function loadMetadata(uri) {
  try {
    const response = await fetch(uri);

    if (!response.ok) {
      throw new Error("Metadata file could not be loaded.");
    }

    const metadata = await response.json();

    $("metadataName").textContent = metadata.name || "—";
    $("metadataDescription").textContent = metadata.description || "—";
    $("metadataImage").textContent = metadata.image || "—";
  } catch (error) {
    console.warn("Metadata loading failed:", error);
    $("metadataName").textContent = "Metadata file not found";
    $("metadataDescription").textContent = "Check the metadata path and frontend server.";
    $("metadataImage").textContent = "—";
  }
}

async function mintNFT() {
  clearResult();

  if (!signer || !nft) {
    setMessage("Connect your wallet and load the NFT contract first.");
    return;
  }

  const metadataURI = $("metadataURI").value.trim();

  if (!metadataURI) {
    setMessage("Enter a metadata URI or file path.");
    return;
  }

  try {
    setMessage("Waiting for wallet confirmation...");

    const tx = await nft.mintNFT(metadataURI);

    setMessage("Transaction submitted. Waiting for confirmation...");

    const receipt = await tx.wait();
    const tokenId = await getMintedTokenId(receipt);

    const owner = await nft.ownerOf(tokenId);
    const tokenURI = await nft.tokenURI(tokenId);

    $("tokenId").textContent = tokenId.toString();
    $("owner").textContent = owner;
    $("tokenURI").textContent = tokenURI;
    $("txHash").textContent = `Transaction hash: ${tx.hash}`;
    $("result").classList.remove("hidden");

    await loadMetadata(tokenURI);

    setMessage("NFT minted successfully. Ownership and metadata are displayed below.");
  } catch (error) {
    console.error(error);

    if (error.code === 4001 || error.code === "ACTION_REJECTED") {
      setMessage("Transaction rejected in the wallet.");
    } else {
      setMessage(
        error.shortMessage ||
        error.reason ||
        "NFT minting failed. Check the wallet, network, contract address, and metadata path."
      );
    }
  }
}

$("connectBtn").addEventListener("click", connectWallet);
$("loadBtn").addEventListener("click", loadContract);
$("mintBtn").addEventListener("click", mintNFT);

if (window.ethereum) {
  window.ethereum.on("accountsChanged", async (accounts) => {
    if (!accounts.length) {
      account = null;
      signer = null;
      $("account").textContent = "—";
      $("walletStatus").textContent = "Wallet not connected.";
      clearResult();
      return;
    }

    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();
    account = await signer.getAddress();
    $("account").textContent = account;

    if (nft) {
      setMessage("Wallet account changed.");
    }
  });

  window.ethereum.on("chainChanged", () => {
    window.location.reload();
  });
}
