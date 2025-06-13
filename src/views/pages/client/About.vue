<template>
    <div class="container">
            <div class="a">
                <Card style="width: 25rem; overflow: hidden">
                    <template #header>
                        <img alt="user header" src="https://primefaces.org/cdn/primevue/images/usercard.png" />
                    </template>
                    <template #title>Advanced Card</template>
                    <template #subtitle>Card subtitle</template>
                    <template #content>
                        <p class="m-0">
                            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Inventore sed consequuntur error repudiandae numquam deserunt quisquam repellat libero asperiores earum nam nobis, culpa ratione quam perferendis esse, cupiditate neque
                            quas!
                        </p>
                    </template>
                    <template #footer>
                        <div class="flex gap-4 mt-1">
                            <Button label="Cancel" severity="secondary" outlined class="w-full" />
                            <Button label="Save" class="w-full" />
                        </div>
                    </template>
                </Card>
            </div>


            <div class="b">
                <Card style="width: 25rem; overflow: hidden">
                    <template #header>
                        <img alt="user header" src="https://primefaces.org/cdn/primevue/images/usercard.png" />
                    </template>
                    <template #title>Advanced Card</template>
                    <template #subtitle>Card subtitle</template>
                    <template #content>
                        <p class="m-0">
                            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Inventore sed consequuntur error repudiandae numquam deserunt quisquam repellat libero asperiores earum nam nobis, culpa ratione quam perferendis esse, cupiditate neque
                            quas!
                        </p>
                    </template>
                    <template #footer>
                        <div class="flex gap-4 mt-1">
                            <Button label="Cancel" severity="secondary" outlined class="w-full" />
                            <Button label="Save" class="w-full" />
                        </div>
                    </template>
                </Card>
            </div>

            <div class="c">
                <Card style="width: 25rem; overflow: hidden">
                    <template #header>
                        <img alt="user header" src="https://primefaces.org/cdn/primevue/images/usercard.png" />
                    </template>
                    <template #title>Advanced Card</template>
                    <template #subtitle>Card subtitle</template>
                    <template #content>
                        <p class="m-0">
                            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Inventore sed consequuntur error repudiandae numquam deserunt quisquam repellat libero asperiores earum nam nobis, culpa ratione quam perferendis esse, cupiditate neque
                            quas!
                        </p>
                    </template>
                    <template #footer>
                        <div class="flex gap-4 mt-1">
                            <Button label="Cancel" severity="secondary" outlined class="w-full" />
                            <Button label="Save" class="w-full" />
                        </div>
                    </template>
                </Card>
            </div>

            <div class="d">
                <Card style="width: 25rem; overflow: hidden">
                    <template #header>
                        <img alt="user header" src="https://primefaces.org/cdn/primevue/images/usercard.png" />
                    </template>
                    <template #title>Advanced Card</template>
                    <template #subtitle>Card subtitle</template>
                    <template #content>
                        <p class="m-0">
                            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Inventore sed consequuntur error repudiandae numquam deserunt quisquam repellat libero asperiores earum nam nobis, culpa ratione quam perferendis esse, cupiditate neque
                            quas!
                        </p>
                    </template>
                    <template #footer>
                        <div class="flex gap-4 mt-1">
                            <Button label="Cancel" severity="secondary" outlined class="w-full" />
                            <Button label="Save" class="w-full" />
                        </div>
                    </template>
                </Card>
            </div>
    </div>
</template>

<script setup lang="ts">

</script>

<style scoped>
.container {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 2rem;
}

.a {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
    height: 50rem;
}

.b {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
    height: 50rem;
}

.c {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
    height: 50rem;
}

.d {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
    height: 50rem;
}


</style>