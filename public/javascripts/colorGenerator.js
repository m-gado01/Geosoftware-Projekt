const colors = ['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00', '#ffff33', '#a65628', '#f781bf', '#999999'];

function generateColor() {
    return colors[Math.round(Math.random() * 1000) % colors.length];
}