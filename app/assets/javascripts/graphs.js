$(function() {
  if($("#systems_graph").length > 0) {
    var width = 870,
        height = 600,
        circle_radius = 10;

    var color = d3.scale.category20();

    var force = d3.layout.force()
        .charge(-250)
        .gravity(0.06)
        .linkDistance(100)
        .size([width, height]);

    var svg = d3.select("#systems_graph").append("svg")
        .attr("width", width)
        .attr("height", height);

    svg.append("defs").selectAll("marker")
        .data(["story_stage", "story_stage_hilighted"])
      .enter().append("marker")
        .attr("id", function(d) { return d; })
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 15)
        .attr("refY", -1.5)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
      .append("path")
        .attr("d", "M0,-5L10,0L0,5")


    d3.json("/stories/systems_graph.json" + window.location.search, function(error, graph) {
      var edges = [];

      graph.links.forEach(function(e) { 
          // Get the source and target nodes
          var sourceNode = graph.nodes.filter(function(n) { return n.id === e.source; })[0],
              targetNode = graph.nodes.filter(function(n) { return n.id === e.target; })[0];

          // Add the edge to the array
          edges.push({source: sourceNode, target: targetNode, type: e.type, id: e.id, url: e.url});
      });

      force
          .nodes(graph.nodes)
          .links(edges)
          .start();

      var drag = force.drag()
          .on("dragstart", dragstart);

      var link = svg.selectAll(".link")
          .data(edges)
        .enter().append("line")
          .attr("marker-end", function(d) { return "url(#" + d.type + ")"; })
          .attr("class", function(d) { return d.type })
          .attr("id", function(d) { return d.type + "_" + d.id })
          .on("click", update_info_panel)

      var node = svg.selectAll(".node")
          .data(graph.nodes)
        .enter().append("g")
          .attr("class", function(d) { 
            var class_name = d.type + " node"
            if(d.type == "person") {
              class_name += " " + d.role
            }
            return class_name 
          })
          .attr("id", function(d) { return d.id })
          .call(drag)
          .on("dblclick", dblclick)

      node.append("circle")
          .attr("r", circle_radius)
          .on("click", update_info_panel)
          .attr("class", "node_circle")

      node.append("circle")
          .attr("r", circle_radius/2)
          .attr("class", "current_node")
          .style("display", "none")

      node.append("text")
          .attr("dx", 12)
          .attr("dy", ".35em")
          .text(function(d) { return d.name; });

      force.on("tick", function() {
        link.attr("x1", function(d) { return within_bounds(d.source.x, width); })
            .attr("y1", function(d) { return within_bounds(d.source.y, height); })
            .attr("x2", function(d) { return within_bounds(d.target.x, width); })
            .attr("y2", function(d) { return within_bounds(d.target.y, height); });

        node.attr("transform", function(d) { return "translate(" + within_bounds(d.x, width) + "," + within_bounds(d.y, height) + ")"; });
      });
    });

    var update_info_panel = function(e) {
      $(".current_node").hide();
      $("#" + e.id + " .current_node").show();
      $.ajax({
        url: e.url,
        error: function(xhr_data) {
          $("#info_panel").html("ERROR")
        },
        success: function(response) {
          $("#info_panel").html(response);
        }
      });
    }

    var within_bounds = function(i, within) {
      return Math.max(circle_radius, Math.min(within - circle_radius, i))
    }

    function dblclick(d) {
      d3.select(this).classed("fixed", d.fixed = false);
    }

    function dragstart(d) {
      d3.select(this).classed("fixed", d.fixed = true);
    }

    $(".story_stage_desc").hover(function(e) {
      var arrow_id = $(e.target).attr("id").replace("_desc", "")
      var el = $("#" + arrow_id)
      if(e.type == "mouseleave") {
        el.css("stroke", "black")
        el.attr("marker-end", "url(#story_stage)")
        if($("#hide_stories").is(':checked')) {
          el.hide()
        }
      } else {
        var last_line = el.parent().find("line:last")
        el.insertAfter(last_line)
        el.css("stroke", "red")
        el.attr("marker-end", "url(#story_stage_hilighted)")
        if($("#hide_stories").is(':checked')) {
          el.show()
        }
      }
    })

    $("#hide_stories").on("change", function(e) {
      if($("#hide_stories").is(':checked')) {
        $(".story_stage").hide();
      } else {
        $(".story_stage").show();
      }
    })

    $(".story_select form").hide();
    $(".story_select a.change_stories").on("click", function() {
      $(".story_select form").toggle();
    })
  }
});