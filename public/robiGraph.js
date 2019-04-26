module.exports = {
    buildMap:buildMap
};



function buildMap(P){
    P.ctx.GAME = GAME;
    P.ctx.GAME.graph = graph;
    function calcWeight(distance) {
		if (distance == 6) {
			return 5;
		} else if (distance == 8) {
			return 6;
		} else if (distance >= 9 && distance % 3 == 0) {
			return 6 + (distance - 9) / 3;
		} else if (distance > 9 && distance % 3 == 1) {
			return 8 + (distance - 10) / 3;
		} else if (distance > 9 && distance % 3 == 2) {
			return 7 + (distance - 11) / 3;
		} else {
			return distance;
		}
	}

	function findAllLinearStreets(from, across) {
		if (!isAszfalt(from)) {
			return;
		}
		if (!across) {
			findAllLinearStreets(from, {
				x: from.x + 1,
				y: from.y
			});
			findAllLinearStreets(from, {
				x: from.x - 1,
				y: from.y
			});
			findAllLinearStreets(from, {
				x: from.x,
				y: from.y + 1
			});
			findAllLinearStreets(from, {
				x: from.x,
				y: from.y - 1
			});
			return;
		}
		if (across.x < 0 || across.y < 0 || across.x >= P.ctx.GAME.width || across.y >= P.ctx.GAME.height) {
			return;
		}
		if (isAszfalt(across)) {
			P._distance = Math.abs(from.x - across.x) + Math.abs(from.y - across.y);
			P.ctx.GAME.graph.addLink(from.x + ":" + from.y, across.x + ":" + across.y, {
				weight: calcWeight(P._distance)
			});
			findAllLinearStreets(from, {
				x: across.x + (across.x - from.x) / P._distance,
				y: across.y + (across.y - from.y) / P._distance
			});
		}
	}

	function line_next(to, dir, from) {
		switch (dir) {
			case RIGHT:
				{
					next = {
						x: (to.x + 1) % 60,
						y: to.y
					};
					circle = (next.x < from.x) ? 1 : 0;
					break;
				}
			case LEFT:
				{
					next = {
						x: (60 + to.x - 1) % 60,
						y: to.y
					};
					circle = (next.x > from.x) ? 1 : 0;
					break;
				}
			case DOWN:
				{
					next = {
						x: to.x,
						y: (to.y + 1) % 60,
					};
					circle = (next.y < from.y) ? 1 : 0;
					break;
				}
			case UP:
				{
					next = {
						x: to.x,
						y: (60 + to.y - 1) % 60
					};
					circle = (next.y > from.y) ? 1 : 0;
					break;
				}
		}
		var link = P.ctx.GAME.graph.getLink(to.x + ":" + to.y, next.x + ":" + next.y);
		if (link) {
			return {
				to: next,
				circle: circle
			};
		} else {
			return null;
		}
	}

	function line_links(from, to, dir, circle) {
		if (from.x == 2) {}
		if (!to) {
			var res = line_next(from, DOWN, from);
			if (res) {
				line_links(from, res.to, DOWN, res.circle);
			}
			res = line_next(from, UP, from);
			if (res) {
				line_links(from, res.to, UP, res.circle);
			}
			res = line_next(from, RIGHT, from);
			if (res) {
				line_links(from, res.to, RIGHT, res.circle);
			}
			res = line_next(from, LEFT, from);
			if (res) {
				line_links(from, res.to, LEFT, res.circle);
			}
			return;
		}
		if (from.x == to.x && from.y == to.y) {
			return;
		} else {
			var dx = to.x - from.x;
			var wx = Math.abs(dx);
			var dy = to.y - from.y;
			var wy = Math.abs(dy);
			if (wx != 0 && wy != 0) {
				alert("Nem egyenes!");
			}
			if (circle) {
				wx = (60 - Math.abs(dx)) % 60;
				wy = (60 - Math.abs(dy)) % 60;
			}
			var distance = wx + wy;
			if (distance > 5 && distance < 35) {
				if (circle) {
					P.ctx.GAME.graph.addLink(from.x + ":" + from.y, from.x + ":" + from.y + ":c", {
						weight: 0
					});
					P.ctx.GAME.graph.addLink(from.x + ":" + from.y + ":c", to.x + ":" + to.y, {
						weight: calcWeight(distance)
					});
					P.ctx.GAME.lines.push({
						x: from.x,
						y: from.y,
						dir: dir,
						dist: distance
					});
				} else {
					P.ctx.GAME.graph.addLink(from.x + ":" + from.y, to.x + ":" + to.y, {
						weight: calcWeight(distance)
					});
					P.ctx.GAME.lines.push({
						x: from.x,
						y: from.y,
						dir: dir,
						dist: distance
					});
				}
			}
			var res = line_next(to, dir, from);
			if (res) {
				line_links(from, res.to, dir, res.circle);
			}
		}
	}

	function cross_link(node) {
		var vmap = P.ctx.GAME.vmap;
		var graph = P.ctx.GAME.graph;
		var node_id = node.x + ":" + node.y;
		var node_dir = vmap[node_id] ? vmap[node_id][0] : null;
		var up_id = node.x + ":" + (node.y - 1);
		var up_dir = vmap[up_id] ? vmap[up_id][0] : null;
		var down_id = node.x + ":" + (node.y + 1);
		var down_dir = vmap[down_id] ? vmap[down_id][0] : null;
		var left_id = (node.x - 1) + ":" + node.y;
		var left_dir = vmap[left_id] ? vmap[left_id][0] : null;
		var right_id = (node.x + 1) + ":" + node.y;
		var right_dir = vmap[right_id] ? vmap[right_id][0] : null;
		if (node_dir == RIGHT) {
			if (up_dir == LEFT) {
				var link = graph.getLink(node_id, up_id);
				if (!link) {
					graph.addLink(node_id, up_id, {
						weight: 1
					});
				}
				link = graph.getLink(up_id, node_id);
				if (!link) {
					graph.addLink(up_id, node_id, {
						weight: 1
					});
				}
			} else if (up_dir == DOWN) {
				link = graph.getLink(up_id, node_id);
				if (!link) {
					graph.addLink(up_id, node_id, {
						weight: 1
					});
				}
			}
			if (right_dir == UP) {
				link = graph.getLink(node_id, right_id);
				if (!link) {
					graph.addLink(node_id, right_id, {
						weight: 1
					});
				}
			}
			if (node.y == P.ctx.GAME.height - 1) {
				link = graph.getLink(node.x + ":" + 0, node.x + ":" + node.y);
				if (!link) {
					graph.addLink(node.x + ":" + 0, node.x + ":" + node.y, {
						weight: 1
					});
				}
			} else if (node.x == P.ctx.GAME.width - 1) {
				link = graph.getLink(node.x + ":" + node.y, 0 + ":" + node.y);
				if (!link) {
					graph.addLink(node.x + ":" + node.y, 0 + ":" + node.y, {
						weight: 1
					});
				}
			}
		} else if (node_dir == LEFT) {
			if (down_dir == RIGHT) {
				link = graph.getLink(node_id, down_id);
				if (!link) {
					graph.addLink(node_id, down_id, {
						weight: 1
					});
				}
				link = graph.getLink(down_id, node_id);
				if (!link) {
					graph.addLink(down_id, node_id, {
						weight: 1
					});
				}
			} else if (down_dir == UP) {
				link = graph.getLink(down_id, node_id);
				if (!link) {
					graph.addLink(down_id, node_id, {
						weight: 1
					});
				}
			}
			if (left_dir == DOWN) {
				link = graph.getLink(node_id, left_id);
				if (!link) {
					graph.addLink(node_id, left_id, {
						weight: 1
					});
				}
			}
			if (node.y == 0) {
				link = graph.getLink(node.x + ":" + (P.ctx.GAME.height - 1), node.x + ":" + node.y);
				if (!link) {
					graph.addLink(node.x + ":" + (P.ctx.GAME.height - 1), node.x + ":" + node.y, {
						weight: 1
					});
				}
			} else if (node.x == 0) {
				link = graph.getLink(node.x + ":" + node.y, (P.ctx.GAME.width - 1) + ":" + node.y);
				if (!link) {
					graph.addLink(node.x + ":" + node.y, (P.ctx.GAME.width - 1) + ":" + node.y, {
						weight: 1
					});
				}
			}
		}
		if (node_dir == DOWN) {
			if (right_dir == UP) {
				link = graph.getLink(node_id, right_id);
				if (!link) {
					graph.addLink(node_id, right_id, {
						weight: 1
					});
				}
				link = graph.getLink(right_id, node_id);
				if (!link) {
					graph.addLink(right_id, node_id, {
						weight: 1
					});
				}
			} else if (right_dir == LEFT) {
				link = graph.getLink(right_id, node_id);
				if (!link) {
					graph.addLink(right_id, node_id, {
						weight: 1
					});
				}
			}
			if (down_dir == RIGHT) {
				link = graph.getLink(node_id, down_id);
				if (!link) {
					graph.addLink(node_id, down_id, {
						weight: 1
					});
				}
			}
			if (node.x == 0) {
				link = graph.getLink((P.ctx.GAME.width - 1) + ":" + node.y, node.x + ":" + node.y);
				if (!link) {
					graph.addLink((P.ctx.GAME.width - 1) + ":" + node.y, node.x + ":" + node.y, {
						weight: 1
					});
				}
			} else if (node.y == P.ctx.GAME.height - 1) {
				link = graph.getLink(node.x + ":" + (P.ctx.GAME.height - 1), node.x + ":" + 0);
				if (!link) {
					graph.addLink(node.x + ":" + (P.ctx.GAME.height - 1), node.x + ":" + 0, {
						weight: 1
					});
				}
			}
		} else if (node_dir == UP) {
			if (left_dir == DOWN) {
				link = graph.getLink(node_id, left_id);
				if (!link) {
					graph.addLink(node_id, left_id, {
						weight: 1
					});
				}
				link = graph.getLink(left_id, node_id);
				if (!link) {
					graph.addLink(left_id, node_id, {
						weight: 1
					});
				}
			} else if (left_dir == RIGHT) {
				link = graph.getLink(left_id, node_id);
				if (!link) {
					graph.addLink(left_id, node_id, {
						weight: 1
					});
				}
			}
			if (up_dir == LEFT) {
				link = graph.getLink(node_id, up_id);
				if (!link) {
					graph.addLink(node_id, up_id, {
						weight: 1
					});
				}
			}
			if (node.y == 0) {
				link = graph.getLink(node.x + ":" + node.y, node.x + ":" + (P.ctx.GAME.height - 1));
				if (!link) {
					graph.addLink(node.x + ":" + node.y, node.x + ":" + (P.ctx.GAME.height - 1), {
						weight: 1
					});
				}
			} else if (node.x == P.ctx.GAME.width - 1) {
				link = graph.getLink(0 + ":" + node.y, (P.ctx.GAME.width - 1) + ":" + node.y);
				if (!link) {
					graph.addLink(0 + ":" + node.y, (P.ctx.GAME.width - 1) + ":" + node.y, {
						weight: 1
					});
				}
			}
		}
	}
	global.cross_link = cross_link;

	function isRSD(from) {
		var up = isAszfalt({
			x: from.x,
			y: from.y - 1
		});
		var right = isAszfalt({
			x: from.x + 1,
			y: from.y
		});
		var down = isAszfalt({
			x: from.x,
			y: from.y + 1
		});
		var left = isAszfalt({
			x: from.x - 1,
			y: from.y
		});
		if (from.dir == RIGHT) {
			if (down) {
				return {
					x: from.x,
					y: from.y + 1,
					dir: DOWN
				};
			} else if (right) {
				return {
					x: from.x + 1,
					y: from.y,
					dir: RIGHT
				};
			} else if (up) {
				return {
					x: from.x,
					y: from.y - 1,
					dir: UP
				};
			}
		} else if (from.dir == LEFT) {
			if (up) {
				return {
					x: from.x,
					y: from.y - 1,
					dir: UP
				};
			} else if (left) {
				return {
					x: from.x - 1,
					y: from.y,
					dir: LEFT
				};
			} else if (down) {
				return {
					x: from.x,
					y: from.y + 1,
					dir: DOWN
				};
			}
		} else if (from.dir == UP) {
			if (right) {
				return {
					x: from.x + 1,
					y: from.y,
					dir: RIGHT
				};
			} else if (up) {
				return {
					x: from.x,
					y: from.y - 1,
					dir: UP
				};
			} else if (left) {
				return {
					x: from.x - 1,
					y: from.y,
					dir: LEFT
				};
			}
		} else if (from.dir == DOWN) {
			if (left) {
				return {
					x: from.x - 1,
					y: from.y,
					dir: LEFT
				};
			} else if (down) {
				return {
					x: from.x,
					y: from.y + 1,
					dir: DOWN
				};
			} else if (right) {
				return {
					x: from.x + 1,
					y: from.y,
					dir: RIGHT
				};
			}
		} else if (!right && left && up && down) {
			var up_right = isAszfalt({
				x: from.x + 1,
				y: from.y - 1
			});
			if (up_right) {
				from.dir = UP;
				return {
					x: from.x,
					y: from.y - 1,
					dir: UP
				};
			}
		} else if (!up && !right && left && down) {
			from.dir = UP;
			return {
				x: from.x - 1,
				y: from.y,
				dir: LEFT
			};
		} else {
			console.info("Not RSD " + JSON.stringify(from));
		}
		return null;
	}
	P._done = {};

	function update_vmap(from, to) {
		P._id = from.x + ":" + from.y;
		P._vmap[P._id] = P._vmap[P._id] || [from.dir, 1, 0];
		P._vmap[P._id][1] = 1;
		P._id = to.x + ":" + to.y;
		P._vmap[P._id] = P._vmap[P._id] || [to.dir, 0, 1];
		P._vmap[P._id][2] = 1;
	}

	function findAllLinearStreets_R(from, across) {
		if (!across && P._done[from.x + ":" + from.y]) {
			return;
		}
		if (!across && !isAszfalt(from)) {
			return;
		}
		if (!across) {
			var across = isRSD(from);
			if (across) {
				findAllLinearStreets_R(from, across);
			}
			return;
		}
		if (across.x < 0 || across.y < 0 || across.x >= P.ctx.GAME.width || across.y >= P.ctx.GAME.height) {
			return;
		}
		if (isAszfalt(across)) {
			P._distance = Math.abs(from.x - across.x) + Math.abs(from.y - across.y);
			update_vmap(from, across);
			P.ctx.GAME.graph.addLink(from.x + ":" + from.y, across.x + ":" + across.y, {
				weight: calcWeight(P._distance)
			});
			cross_link(from);
			cross_link(across);
			if (P._graph_bind) {
				P._graph_bind.push({
					fromId: from.x + ":" + from.y + ":" + from.dir,
					toId: across.x + ":" + across.y + ":" + across.dir
				});
			}
			P._done[from.x + ":" + from.y] = 1;
			var next = isRSD(across);
			if (next) {
				if (false && next.dir == across.dir && across.dir == from.dir) {
					findAllLinearStreets_R(from, next);
					return;
				} else {
					update_vmap(across, next);
					P.ctx.GAME.graph.addLink(across.x + ":" + across.y, next.x + ":" + next.y, {
						weight: 1
					});
					cross_link(next);
					if (P._graph_bind) {
						P._graph_bind.push({
							fromId: across.x + ":" + across.y + ":" + across.dir,
							toId: next.x + ":" + next.y + ":" + next.dir
						});
					}
					P._done[across.x + ":" + across.y] = 1;
					findAllLinearStreets_R(next);
					return;
				}
			}
		}
	}

	function build_graph(from) {
		P._vmap = {};
		P.ctx.GAME.vmap = P._vmap;
		if (from) {
			if (P.ctx.GAME.LDRIVE) {
				findAllLinearStreets_L(from);
			} else if (P.ctx.GAME.RDRIVE) {
				findAllLinearStreets_R(from);
			} else {
				findAllLinearStreets(from);
			}
		} else {
			for (P._x = 0; P._x < P.ctx.GAME.width; P._x++) {
				for (P._y = 0; P._y < P.ctx.GAME.height; P._y++) {
					if (P.ctx.GAME.LDRIVE) {
						findAllLinearStreets_L({
							x: P._x,
							y: P._y
						});
					} else if (P.ctx.GAME.RDRIVE) {
						findAllLinearStreets_R({
							x: P._x,
							y: P._y
						});
					} else {
						findAllLinearStreets({
							x: P._x,
							y: P._y
						});
					}
				}
			}
			P.ctx.GAME.lines = [];
			for (P._x = 0; P._x < P.ctx.GAME.width; P._x++) {
				for (P._y = 0; P._y < P.ctx.GAME.height; P._y++) {
					line_links({
						x: P._x,
						y: P._y
					});
				}
			}
		}
	};
	test_graph_dist = function() {
		var graph = P.ctx.GAME.graph;
		graph.forEachLink(function(link) {
			var x1 = Number(link.fromId.split(":")[0]);
			var x2 = Number(link.toId.split(":")[0]);
			if (Math.abs(x1 - x2) != 0 && Math.abs(x1 - x2) != 1) {
				console.info(JSON.stringify(link));
			} else {
				var y1 = Number(link.fromId.split(":")[1]);
				var y2 = Number(link.toId.split(":")[1]);
				if (Math.abs(y1 - y2) != 0 && Math.abs(y1 - y2) != 1) {
					console.info(JSON.stringify(link));
				}
			}
		});
	};
	test_graph = function(from) {
		P._done = {};
		P._graph_bind = [];
		build_graph(from);
		core_bind({
			path: "ctx/graph_step",
			value: P._graph_bind,
			force: 1
		});
		P._graph_bind = null;
	};
	build_graph();
	
}