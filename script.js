// State management
let state = {
    balance: 10000,
    portfolio: {},
    tradeHistory: [],
    availableCoins: [
        { symbol: 'DOGE', name: 'Dogecoin', price: 0.15 },
        { symbol: 'SHIB', name: 'Shiba Inu', price: 0.000008 },
        { symbol: 'PEPE', name: 'Pepe Coin', price: 0.0000012 },
        { symbol: 'FLOKI', name: 'Floki Inu', price: 0.000025 },
        { symbol: 'BONK', name: 'Bonk', price: 0.000012 },
        { symbol: 'WIF', name: 'dogwifhat', price: 0.35 }
    ]
};

// Telegram Web App initialization
let tg = window.Telegram.WebApp;
tg.expand();
tg.enableClosingConfirmation();

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupTradingInterface();
    updateDashboard();
});

function initializeApp() {
    // Load any saved state
    const savedState = localStorage.getItem('cypherx_state');
    if (savedState) {
        state = { ...state, ...JSON.parse(savedState) };
    }
}

function saveState() {
    localStorage.setItem('cypherx_state', JSON.stringify(state));
}

// Navigation
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(sectionId).classList.add('active');
    
    // Update nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.currentTarget.classList.add('active');
    
    // Update section-specific content
    if (sectionId === 'market') updateMarketView();
    if (sectionId === 'portfolio') updatePortfolioView();
}

// Dashboard
function updateDashboard() {
    document.getElementById('balance').textContent = state.balance.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    const portfolioValue = calculatePortfolioValue();
    document.getElementById('portfolio-value').textContent = `$${portfolioValue.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;

    const pnl = portfolioValue - 10000;
    document.getElementById('pnl').textContent = `${pnl >= 0 ? '+' : ''}$${pnl.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
    document.getElementById('pnl').style.color = pnl >= 0 ? '#10b981' : '#ef4444';

    document.getElementById('total-trades').textContent = state.tradeHistory.length;
    document.getElementById('cash-balance').textContent = `$${state.balance.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;

    updateRecentTrades();
    updateSignal();
}

function calculatePortfolioValue() {
    let total = state.balance;
    for (const [symbol, position] of Object.entries(state.portfolio)) {
        const coin = state.availableCoins.find(c => c.symbol === symbol);
        if (coin) {
            total += position.amount * coin.price;
        }
    }
    return total;
}

function updateRecentTrades() {
    const container = document.getElementById('recent-trades');
    const recentTrades = state.tradeHistory.slice(-5).reverse();

    if (recentTrades.length === 0) {
        container.innerHTML = '<div class="no-trades">No trades yet</div>';
        return;
    }

    container.innerHTML = recentTrades.map(trade => `
        <div class="trade-item">
            <div class="trade-info">
                <span class="trade-action ${trade.action.toLowerCase()}">${trade.action}</span>
                <span class="trade-amount">${trade.amount} ${trade.coin}</span>
            </div>
            <div class="trade-price">$${trade.price.toFixed(8)}</div>
        </div>
    `).join('');
}

function updateSignal() {
    const signals = [
        "🔴 Twitter Trend Detected",
        "🔵 TikTok Viral Signal", 
        "🟢 Reddit Hype Building",
        "🟡 Influencer Mention",
        "🟣 Community Pump Signal",
        "⚫️ AI Pattern Recognition"
    ];
    const randomSignal = signals[Math.floor(Math.random() * signals.length)];
    document.getElementById('current-signal').textContent = randomSignal;
    document.getElementById('trade-signal').textContent = randomSignal;
}

// Market View
function updateMarketView() {
    const container = document.getElementById('market-list');
    
    container.innerHTML = state.availableCoins.map(coin => {
        const change = (Math.random() * 0.3 - 0.1); // -10% to +20%
        const trendEmoji = change > 0 ? '📈' : change < 0 ? '📉' : '➡️';
        
        return `
            <div class="market-item">
                <div class="coin-info">
                    <span class="coin-symbol">${coin.symbol}</span>
                    <span class="coin-trend">${trendEmoji}</span>
                </div>
                <div class="coin-price">$${coin.price.toFixed(8)}</div>
            </div>
        `;
    }).join('');
}

// Trading Interface
function setupTradingInterface() {
    const container = document.getElementById('coins-grid');
    
    container.innerHTML = state.availableCoins.map(coin => `
        <div class="trade-btn buy" onclick="executeTrade('BUY', '${coin.symbol}')">
            📈 BUY ${coin.symbol}
        </div>
        <div class="trade-btn sell" onclick="executeTrade('SELL', '${coin.symbol}')">
            📉 SELL ${coin.symbol}
        </div>
    `).join('');
}

function executeTrade(action, coinSymbol) {
    const coin = state.availableCoins.find(c => c.symbol === coinSymbol);
    if (!coin) return;

    const amount = Math.floor(Math.random() * 500) + 10;
    const cost = amount * coin.price;

    // Simulate trade execution
    if (action === 'BUY') {
        if (cost > state.balance) {
            showTradeResult(false, 'Insufficient balance');
            return;
        }
        state.balance -= cost;
        if (!state.portfolio[coinSymbol]) {
            state.portfolio[coinSymbol] = { amount: 0, cost: 0 };
        }
        state.portfolio[coinSymbol].amount += amount;
        state.portfolio[coinSymbol].cost += cost;
    } else { // SELL
        if (!state.portfolio[coinSymbol] || state.portfolio[coinSymbol].amount < amount) {
            showTradeResult(false, 'Insufficient coins');
            return;
        }
        const revenue = amount * coin.price;
        state.balance += revenue;
        state.portfolio[coinSymbol].amount -= amount;
    }

    // Record trade
    const trade = {
        coin: coinSymbol,
        action: action,
        amount: amount,
        price: coin.price,
        time: new Date().toLocaleTimeString(),
        signal: document.getElementById('trade-signal').textContent
    };
    
    state.tradeHistory.push(trade);
    simulateMarketMove();
    saveState();
    showTradeResult(true, trade);
    updateDashboard();
    updatePortfolioView();
}

function showTradeResult(success, data) {
    const modal = document.getElementById('trade-modal');
    const tradeDetails = document.getElementById('trade-details');
    
    if (success) {
        const trade = data;
        tradeDetails.innerHTML = `
            <div style="text-align: center; padding: 1rem;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">🎯</div>
                <h3 style="color: #10b981; margin-bottom: 1rem;">Trade Executed Successfully!</h3>
                <div style="background: #1a1b2f; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                    <div>${trade.signal}</div>
                    <div style="font-size: 1.2rem; font-weight: bold; margin: 0.5rem 0;">
                        ${trade.action} ${trade.amount} ${trade.coin}
                    </div>
                    <div>@ $${trade.price.toFixed(8)}</div>
                    <div style="color: #94a3b8; font-size: 0.9rem; margin-top: 0.5rem;">
                        ${trade.time}
                    </div>
                </div>
            </div>
        `;
    } else {
        tradeDetails.innerHTML = `
            <div style="text-align: center; padding: 1rem;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">❌</div>
                <h3 style="color: #ef4444; margin-bottom: 1rem;">Trade Failed</h3>
                <p>${data}</p>
            </div>
        `;
    }
    
    modal.classList.add('active');
}

function closeModal() {
    document.getElementById('trade-modal').classList.remove('active');
}

function simulateMarketMove() {
    state.availableCoins.forEach(coin => {
        const change = (Math.random() * 0.4 - 0.15); // -15% to +25%
        coin.price *= (1 + change);
        coin.price = Math.max(coin.price, 0.0000001);
    });
}

// Portfolio
function updatePortfolioView() {
    const container = document.getElementById('portfolio-positions');
    const positions = Object.entries(state.portfolio);
    
    if (positions.length === 0) {
        container.innerHTML = '<div class="no-positions">No positions open</div>';
        return;
    }
    
    container.innerHTML = positions.map(([symbol, position]) => {
        const coin = state.availableCoins.find(c => c.symbol === symbol);
        if (!coin) return '';
        
        const currentValue = position.amount * coin.price;
        const pnl = currentValue - position.cost;
        const pnlPercent = (pnl / position.cost) * 100;
        const trendEmoji = pnl > 0 ? '📈' : pnl < 0 ? '📉' : '➡️';
        
        return `
            <div class="market-item">
                <div class="coin-info">
                    <span class="coin-symbol">${symbol}</span>
                    <span class="coin-trend">${trendEmoji}</span>
                </div>
                <div class="coin-price">
                    <div>${position.amount.toLocaleString()} coins</div>
                    <div style="color: ${pnl >= 0 ? '#10b981' : '#ef4444'}; font-size: 0.9rem;">
                        ${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)} (${pnlPercent.toFixed(2)}%)
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Random trade generation for demo
function generateRandomTrade() {
    if (state.availableCoins.length === 0) return;
    
    const coin = state.availableCoins[Math.floor(Math.random() * state.availableCoins.length)];
    const action = Math.random() > 0.5 ? 'BUY' : 'SELL';
    executeTrade(action, coin.symbol);
}

// Auto-generate some random trades for demo
setInterval(() => {
    if (Math.random() < 0.3) { // 30% chance every 10 seconds
        generateRandomTrade();
    }
}, 10000);