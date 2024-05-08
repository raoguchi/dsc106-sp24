
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function to_number(value) {
        return value === '' ? null : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    let render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = /* @__PURE__ */ Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        // Do not reenter flush while dirty components are updated, as this can
        // result in an infinite loop. Instead, let the inner flush handle it.
        // Reentrancy is ok afterwards for bindings etc.
        if (flushidx !== 0) {
            return;
        }
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            try {
                while (flushidx < dirty_components.length) {
                    const component = dirty_components[flushidx];
                    flushidx++;
                    set_current_component(component);
                    update(component.$$);
                }
            }
            catch (e) {
                // reset dirty state to not end up in a deadlocked state and then rethrow
                dirty_components.length = 0;
                flushidx = 0;
                throw e;
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    /**
     * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
     */
    function flush_render_callbacks(fns) {
        const filtered = [];
        const targets = [];
        render_callbacks.forEach((c) => fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c));
        targets.forEach((c) => c());
        render_callbacks = filtered;
    }
    const outroing = new Set();
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            flush_render_callbacks($$.after_update);
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: [],
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            if (!is_function(callback)) {
                return noop;
            }
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.58.0' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation, has_stop_immediate_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        if (has_stop_immediate_propagation)
            modifiers.push('stopImmediatePropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src\App.svelte generated by Svelte v3.58.0 */

    const file = "src\\App.svelte";

    function create_fragment(ctx) {
    	let main;
    	let div;
    	let label;
    	let t0;
    	let t1;
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			main = element("main");
    			div = element("div");
    			label = element("label");
    			t0 = text(/*slider_label*/ ctx[1]);
    			t1 = space();
    			input = element("input");
    			add_location(label, file, 184, 2, 5314);
    			attr_dev(input, "id", "slider");
    			attr_dev(input, "type", "range");
    			attr_dev(input, "min", "1");
    			attr_dev(input, "max", "1440");
    			add_location(input, file, 185, 2, 5347);
    			attr_dev(div, "class", "overlay");
    			add_location(div, file, 183, 4, 5289);
    			add_location(main, file, 182, 0, 5277);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div);
    			append_dev(div, label);
    			append_dev(label, t0);
    			append_dev(div, t1);
    			append_dev(div, input);
    			set_input_value(input, /*slider_time*/ ctx[0]);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "change", /*input_change_input_handler*/ ctx[4]),
    					listen_dev(input, "input", /*input_change_input_handler*/ ctx[4])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*slider_label*/ 2) set_data_dev(t0, /*slider_label*/ ctx[1]);

    			if (dirty & /*slider_time*/ 1) {
    				set_input_value(input, /*slider_time*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function scaleRadiusTrafficVolume(traffic, maxTraffic = 500) {
    	const scaleRadius = d3.scaleSqrt().domain([0, 1, maxTraffic]).range([0, 3, 20]);
    	return scaleRadius(traffic);
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	mapboxgl.accessToken = "pk.eyJ1Ijoicm9ndWNoaSIsImEiOiJjbHZ5MnR5azEycnlpMmpvNXpyY2wxcjJlIn0.wL6ajYMoAUnk0zhvss7y8A";

    	const map = new mapboxgl.Map({
    			container: "map",
    			style: "mapbox://styles/mapbox/light-v11",
    			center: [-71.0942, 42.3601],
    			zoom: 13, // starting zoom level
    			minZoom: 12,
    			maxZoom: 15
    		});

    	map.on("load", () => {
    		map.addSource("boston_route", {
    			type: "geojson",
    			data: "https://bostonopendata-boston.opendata.arcgis.com/datasets/boston::existing-bike-network-2022.geojson?outSR=%7B%22latestWkid%22%3A3857%2C%22wkid%22%3A102100%7D"
    		});

    		map.addLayer({
    			id: "boston_route",
    			type: "line",
    			source: "boston_route",
    			paint: { "line-color": "#BEE5B0", "line-width": 3 }
    		});

    		map.addSource("cambridge_route", {
    			type: "geojson",
    			data: "https://raw.githubusercontent.com/cambridgegis/cambridgegis_data/main/Recreation/Bike_Facilities/RECREATION_BikeFacilities.geojson"
    		});

    		map.addLayer({
    			id: "cambridge_route",
    			type: "line",
    			source: "cambridge_route",
    			paint: { "line-color": "#FF474C", "line-width": 3 }
    		});
    	});

    	map.on("viewreset", position_station_markers);
    	map.on("move", position_station_markers);
    	map.on("moveend", position_station_markers);

    	function create_station_markers(station_data) {
    		station_markers = marker_container.selectAll("circle").data(station_data).enter().append("circle").attr("r", 5).style("fill", "#808080").attr("stroke", "#808080").attr("stroke-width", 1).attr("fill-opacity", 0.4).attr("name", function (d) {
    			return d["name"];
    		});

    		position_station_markers();
    	}

    	function position_station_markers() {
    		station_markers.attr("cx", function (d) {
    			return project(d).x;
    		}).attr("cy", function (d) {
    			return project(d).y;
    		});
    	}

    	function project(d) {
    		return map.project(new mapboxgl.LngLat(+d.lon, +d.lat));
    	}

    	function update_station_markers() {
    		station_markers.transition().duration(1000).attr("r", function (d) {
    			let trafficVolume = arrivals[d["station_id"]] + departures[d["station_id"]];
    			return scaleRadiusTrafficVolume(trafficVolume);
    		});
    	}

    	function tallyTrips(trips_data) {
    		arrivals.fill(0);
    		departures.fill(0);

    		for (let i = 0; i < trips_data.length; ++i) {
    			arrivals[trips_data[i]["end station id"]]++;
    			departures[trips_data[i]["start station id"]]++;
    		}
    	}

    	function filterTrips(sliderTime) {
    		let value = sliderTimeScale(sliderTime);
    		let filterWindowHours = 0;
    		let filterWindowMinutes = 120;
    		let filterHours = value.getHours();
    		let filterMinutes = value.getMinutes();

    		return trip_data.filter(function (trip) {
    			let tripStartTime = new Date(trip["starttime"]);
    			let tripEndTime = new Date(trip["stoptime"]);
    			let filterStartTime = new Date(tripStartTime.getTime());
    			let filterEndTime = new Date(tripEndTime.getTime());
    			filterStartTime.setHours(filterHours - filterWindowHours / 2);
    			filterEndTime.setHours(filterHours + filterWindowHours / 2);
    			filterStartTime.setMinutes(filterMinutes - filterWindowMinutes / 2);
    			filterEndTime.setMinutes(filterMinutes + filterWindowMinutes / 2);
    			return tripStartTime >= filterStartTime && tripStartTime <= filterEndTime || tripEndTime >= filterStartTime && tripEndTime <= filterEndTime;
    		});
    	}

    	const sliderTimeScale = d3.scaleTime().domain([0, 1440]).range([new Date("2015-12-01 00:00"), new Date("2015-12-02 00:00")]);
    	let stationsFile = "https://raw.githubusercontent.com/dsc-courses/dsc106-wi24/gh-pages/resources/data/lab6_station_info.json";
    	let tripFile = "https://raw.githubusercontent.com/dsc-courses/dsc106-wi24/gh-pages/resources/data/lab6_bluebikes_2020.csv";
    	let station_data = [];
    	let station_markers;
    	let trip_data = [];
    	let arrivals = new Array(600).fill(0);
    	let departures = new Array(600).fill(0);
    	let filtered_trip_data = [];
    	let slider_time = 720;
    	let slider_label = "";
    	fetch(stationsFile).then(response => response.json()).then(d => station_data = d.data.stations).then(d => create_station_markers(d));

    	d3.csv(tripFile).then(function (d) {
    		$$invalidate(2, trip_data = d);
    	}); // console.log(trip_data);

    	const marker_container = d3.select(map.getCanvasContainer()).append("svg").attr("width", "100%").attr("height", "100%").style("position", "absolute").style("z-index", 2);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function input_change_input_handler() {
    		slider_time = to_number(this.value);
    		$$invalidate(0, slider_time);
    	}

    	$$self.$capture_state = () => ({
    		map,
    		create_station_markers,
    		position_station_markers,
    		project,
    		update_station_markers,
    		scaleRadiusTrafficVolume,
    		tallyTrips,
    		filterTrips,
    		sliderTimeScale,
    		stationsFile,
    		tripFile,
    		station_data,
    		station_markers,
    		trip_data,
    		arrivals,
    		departures,
    		filtered_trip_data,
    		slider_time,
    		slider_label,
    		marker_container
    	});

    	$$self.$inject_state = $$props => {
    		if ('stationsFile' in $$props) stationsFile = $$props.stationsFile;
    		if ('tripFile' in $$props) tripFile = $$props.tripFile;
    		if ('station_data' in $$props) station_data = $$props.station_data;
    		if ('station_markers' in $$props) station_markers = $$props.station_markers;
    		if ('trip_data' in $$props) $$invalidate(2, trip_data = $$props.trip_data);
    		if ('arrivals' in $$props) arrivals = $$props.arrivals;
    		if ('departures' in $$props) departures = $$props.departures;
    		if ('filtered_trip_data' in $$props) $$invalidate(3, filtered_trip_data = $$props.filtered_trip_data);
    		if ('slider_time' in $$props) $$invalidate(0, slider_time = $$props.slider_time);
    		if ('slider_label' in $$props) $$invalidate(1, slider_label = $$props.slider_label);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*trip_data, slider_time, filtered_trip_data*/ 13) {
    			{
    				if (trip_data.length !== 0) {
    					$$invalidate(3, filtered_trip_data = filterTrips(slider_time));
    					tallyTrips(filtered_trip_data);
    					update_station_markers();
    				}

    				$$invalidate(1, slider_label = sliderTimeScale(slider_time).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }));
    			}
    		}
    	};

    	return [
    		slider_time,
    		slider_label,
    		trip_data,
    		filtered_trip_data,
    		input_change_input_handler
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    var app = new App({
    	target: document.body
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
