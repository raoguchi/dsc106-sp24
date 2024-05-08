<script>
	import * as d3 from 'd3';
	// our interactive data
	export let todo_category = [];

	let arcGenerator = d3.arc()
			.innerRadius(10)
			.outerRadius(100)
			.padAngle(.02)
			.cornerRadius(4);
	let arc_data = [
			{startAngle: 0, endAngle: 0.2},
			{startAngle: 0.2, endAngle: 0.6},
			{startAngle: 0.6, endAngle: 1.4},
			{startAngle: 1.4, endAngle: 3},
			{startAngle: 3, endAngle: 2* Math.PI}
	];
	


	$: {
		// interactive data here
		console.log(JSON.stringify(todo_category));
	}

</script>

<div class="visualization">
	<svg width="500" height="500">
		<g transform="translate(250,120)">
				{#each arc_data as data, index}
				<path 
					d={arcGenerator({
						startAngle: data.startAngle,
						endAngle: data.endAngle
					})}
				/>
				{/each}

		</g>
	</svg>
</div>

<style>
	.visualization {
		font: 25px sans-serif;
		margin: auto;
		margin-top: 1px;
		text-align: middle;
	}

	/* dynamic classes for the tooltip */
	.tooltip-hidden {
		visibility: hidden;
		font-family: "Nunito", sans-serif;
		width: 200px;
		position: absolute;
	}

	.tooltip-visible {
		font: 25px sans-serif;
		font-family: "Nunito", sans-serif;
		visibility: visible;
		background-color: #f0dba8;
		border-radius: 10px;
		width: 200px;
		color: black;
		position: absolute;
		padding: 10px;
	}
</style>