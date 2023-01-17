<script>
    import { Index } from "$lib/data";

	const index = new Index();
</script>

{$index}

<button on:click={() => index.increment()}>
	Increment
</button>