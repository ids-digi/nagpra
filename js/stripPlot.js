

/* 
    STRIP CHART
*/
const drawStripChart = (data) => {

    data = data.map((d) => {
        d['MNI'] = parseInt(d['MNI'])
        d['AFO'] = parseInt(d['AFO'])
        return d
    })
    // console.log(data)

    var tooltip = d3.select("body")
        .append("div")
        .style("position", "absolute")
        .attr('class', 'tooltip')
        .style("z-index", "10")
        .style("visibility", "hidden")

    // set width/height (aspect ratio) for map
    var width = 450,
        height = 100;
    const margin = ({ top: 20, right: 10, bottom: 10, left: 10 })
    // grab div by id, inject svg
    var svg = d3.select("#strip-chart").append("svg")
        .attr("preserveAspectRatio", "xMidYMid")
        .attr("viewBox", "0 0 " + width + " " + height);

    const x = d3.scaleLinear()
        .domain([0, 10000])
        // .domain(d3.extent(data, d => d.MNI))
        .rangeRound([margin.left + 10, width - margin.right])

    const y = d3.scalePoint()
        .domain([1, 1])
        .rangeRound([margin.top, height - margin.bottom])
        .padding(1)

    const xAxis = g => g
        .attr("transform", `translate(0,${height - 34})`)
        .call(d3.axisBottom(x).tickValues([0, 10000]))
        .call(g => g.selectAll(".domain").remove())
        .call(g => g.selectAll(".tick line").remove())

    const yAxis = g => g
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y))
        .call(g => g.selectAll(".domain").remove())
        .call(g => g.selectAll(".tick").remove())

    svg.append("g")
        .call(xAxis);

    svg.append("g")
        .call(yAxis);

    svg.append("g")
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .selectAll("path")
        .data(data)
        .join("rect")
        .attr("class", (d) => d.Institution == "Indiana University" ? "iu-strip strip-box" : "strip-box")
        // .attr("class", (d, i) => d.Institution == "Indiana University" ? "iu-strip strip-box" : "strip-box")
        .attr('stroke', 'none')
        .attr('fill', 'steelblue')
        .attr('opacity', .3)
        .attr('width', '2px')
        .attr('height', '30px')
        .attr("x", d => x(d['MNI']))
        .attr("y", y(1) - 15)
        .on('mouseover', (d, i) => {
            console.log(d)
            // d.target.style.fill = 'red'
            // d.target.style.transition = '.4s stroke'
            d.target.style.strokeWidth = '1px'
            d.target.style.stroke = 'steelblue'
            // d.target.style.width = 'steelblue'
            d.target.style.opacity = 1
            // .style("stroke", "red")

            console.log(tooltip)

            tooltip.style("opacity", 1)
                .html(`<p><strong>${i.Institution}</strong> still has remains of at least <strong>${d3.format(",")(i.MNI)}</strong> individuals</p>`)
                .style("visibility", 'visible')
                .style("left", (d.pageX + 10) + "px")
                .style("top", (d.pageY + 10) + "px")
        }).on("mousemove", (d, i) => {
            tooltip.style("opacity", 1)
                .style("left", (d.pageX + 10) + "px")
                .style("top", (d.pageY + 10) + "px")
        }).on("mouseout", (d, i) => {
            tooltip.style("opacity", 0)
                .style("visibility", 'hidden')

            d.target.style.strokeWidth = 0
            d.target.style.opacity = .3
        })

    svg.append("g")
        .append("rect")
        .attr('stroke', '#d3d3d3')
        .attr('width', width - margin.right - margin.left * 2)
        .attr('height', '30px')
        .attr('fill', 'none')
        .attr("x", 20)
        .attr('y', y(1) - 15)

    d3.selectAll(".tick text")
        .attr("text-anchor", (d, i) => i % 2 ? "end" : "start")
}

const asyncStripChart = async () => {
    return d3.csv('./files/strip_chart_data.csv')
}
    // once promises return, run the map drawing function
    ; (async () => {
        drawStripChart(await asyncStripChart())
    })()
