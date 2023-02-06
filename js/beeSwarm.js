/*
    BEESWARM PLOT
*/

const drawBeeswarm = (data) => {
    // convert strings to integers, remove zeroes
    data = data.map((d) => {
        d['MNI'] = +d['MNI']
        d['AFO'] = +d['AFO']
        return d
    }).filter((d) => d.MNI > 0)

    // create tooltip for later
    var tooltip = d3.select("body")
        .append("div")
        .style("position", "absolute")
        .attr('class', 'tooltip')
        .style("z-index", "10")
        .style("visibility", "hidden")

    // set width/height (aspect ratio) for container
    var width = 768,
        height = 400;
    const margin = ({ top: 0, right: 40, bottom: 0, left: 40 })

    // grab div by id, inject svg
    var svg = d3.select("#beeswarm").append("svg")
        .attr("preserveAspectRatio", "xMidYMid")
        .attr("viewBox", "0 0 " + width + " " + (height + margin.top + margin.bottom));

    // establish x scale
    var xScale = d3.scaleLinear()
        .domain([0, 10000])
        .range([margin.left + 50, width - margin.right])
    // create force layout for beeswarm
    var simulation = d3.forceSimulation(data)
        .force("x", d3.forceX((d) => xScale(+d.MNI)).strength(1))
        .force("y", d3.forceY((height / 2)))
        .force("collide", d3.forceCollide(6))
        .stop()
    // apply simulation
    for (var i = 0; i < data.length; ++i) simulation.tick();
    var circles = svg.selectAll(".beeCircle")
        .data(data, (d) => d.MNI);//join the data

    circles.exit()//this is the exit selection
        .attr("cx", 0)
        .attr("cy", (height / 2))
        .remove();

    circles.enter()//this is the enter selection
        .append("circle")
        .attr("class", d => `beeswarm-circle ${d.Institution == "Indiana University" ? "IU" : ""}`)
        .attr("cx", 0)
        .attr("cy", (height / 2))
        .attr("r", 5)
        .style('fill', (d) => {
            if (d.MNI > 0 && d.MNI <= 10) {
                return 'rgb(235, 241, 253)'
            } else if (d.MNI > 10 && d.MNI <= 100) {
                return 'rgb(211, 227, 242)'
            } else if (d.MNI >= 100 && d.MNI < 1000) {
                return 'rgb(88, 159, 206)'
            } else if (d.MNI >= 1000 && d.MNI < 10000) {
                return 'rgb(49, 130, 189)'
            } else {
                return '#d3d3d3'
            }
        })
        .merge(circles)//and the "merge" unify enter and update selections!
        .attr("cx", (d) => d.x)
        .attr("cy", (d) => d.y);

    var xline = svg.append("line")
        .attr("stroke", "gray")
        .attr("stroke-dasharray", "1,2");

    const iuBubble = d3.select('.IU')

    xline.attr("x1", iuBubble.attr("cx"))
        .attr("y1", iuBubble.attr("cy"))
        .attr("y2", +iuBubble.attr("cy") - 40)
        .attr("x2", iuBubble.attr("cx"))
        .attr("opacity", 1);

    svg.append("g")
        .attr("class", "labels")
        .style("font-family", "Inter")
        .selectAll("text")
        .data(data.filter(d => d.Institution == "Indiana University"))
        .enter().append("text")
        .attr("dx", d => xScale(d.MNI))
        .attr("dy", +iuBubble.attr("cy") - 50)
        .attr('text-anchor', 'middle')
        .text("IU: 4,838");

    for (let n of [2589, 9336]) {
        svg.append("line")
            .attr("stroke", "var(--darkgray")
            .attr("x1", xScale(n) + (n == 9336 ? 10 : 0) + (n == 1 ? -60 : 0))
            .attr("x2", xScale(n) + (n == 9336 ? 10 : 0) + (n == 1 ? -60 : 0))
            .attr("y1", height / 2 + 35)
            .attr("y2", height / 2 + 20)
    }

    const pairs = [[2589, 9336]]

    for (let i in pairs) {
        console.log(xScale(pairs[i][0] + pairs[i][1]) + (i == 0 ? -60 : 10))
        svg.append("text")
            .attr("dx", (xScale(pairs[i][0]) + xScale(pairs[i][1]) + (i == 1 ? -60 : 10)) / 2)
            .attr("dy", height / 2 + 60)
            .attr('text-anchor', 'middle')
            .style('font-family', 'Inter')
            .style('font-size', 14)
            .text("10 institutions own 49.4% of all reported remains")
    }

    var top50 = svg.append("line")
        .attr("stroke", "var(--darkgray)")

    top50.attr("x1", xScale(2589))
        .attr("x2", xScale(9336) + 10)
        .attr('y1', height / 2 + 35)
        .attr('y2', height / 2 + 35)
        .attr("opacity", 1);

    svg.append("g")
        .attr("class", "legendOrdinal")
        .attr("transform", "translate(20,20)");

    var categories = ["1-10", "11-100", "101-1,000", "1,001-10,000"];

    var ordinal = d3.scaleOrdinal()
        .domain(categories)
        // .range(categories.map((val, i) =>
        //     d3.interpolateBlues(i / (categories.length - 1))
        // ));
        .range(['rgb(235, 241, 253)', 'rgb(211, 227, 242)', 'rgb(88, 159, 206)', 'rgb(49, 130, 189)'])


    svg.append("g")
        .attr("class", "legendLinear")
        .attr("transform", `translate(${width / 2 - 70},${margin.top + 25})`)
        .attr("right: 0")

    var legendLinear = d3.legendColor()
        .shapeWidth(70)
        .orient('horizontal')
        .scale(ordinal)
        .labelAlign('center')
        .labelWrap(10)
        .title("Number of federally reported ancestral remains not yet available for repatriation")
        .titleWidth(300)

    svg.select(".legendLinear")
        .call(legendLinear);

    d3.selectAll(".beeswarm-circle")
        .on("mouseover", (d, i) => {
            // d3.selectAll('.beeswarm-circle').attr('opacity', .3)
            // d3.select(d.srcElement).attr('opacity', 1)
            tooltip.html(`<p><strong>${i.Institution}</strong> reported ancestral remains of at least <strong>${d3.format(",")(i.MNI)}</strong> individual${i.MNI == 1 ? '' : 's'}</p>`)
                .style('top', d.pageY - 12 + 'px')
                .style('left', d.pageX + 25 + 'px')
                .style('visibility', 'visible')
                .style("opacity", 1)

        }).on("mousemove", (d, i) => {
            tooltip.html(`<p><strong>${i.Institution}</strong> reported ancestral remains of at least <strong>${d3.format(",")(i.MNI)}</strong> individual${i.MNI == 1 ? '' : 's'}</p>`)
                .style('top', d.pageY - 12 + 'px')
                .style('left', d.pageX + 25 + 'px')
                .style('visibility', 'visible')
                .style("opacity", 1);

        }).on("mouseout", function (d) {
            // d3.selectAll('.beeswarm-circle').attr('opacity', 1)
            tooltip.style("opacity", 0);
            // xline.attr("opacity", 0);
        });
}

const asyncBeeswarm = async () => {
    return d3.csv('./files/strip_chart_data.csv')
}
    // once promises return, run the map drawing function
    ; (async () => {
        drawBeeswarm(await asyncBeeswarm())
    })()