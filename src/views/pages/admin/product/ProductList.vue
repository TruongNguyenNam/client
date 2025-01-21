<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue';
import { ProductService } from '../../../../service/ProductServiceLegacy';
import type { ProductResponse, ProductApiResponse } from '../../../../model/product';
import { RouterLink } from 'vue-router';

const listProduct = ref<ProductResponse[]>([]);
const loading = ref(false);
const filters = ref({
    global: { value: undefined, matchMode: 'contains' },
});
const page = ref(1);
const size = ref(5);
const totalRecords = ref(0);
const first = ref(0);
const selectedProducts = ref<ProductResponse[]>([]);

// Fetch data
onMounted(async () => {
    await fetchData();
});

// Watch for filter changes
watch(() => filters.value.global.value, async (newValue) => {
    page.value = 0;
    first.value = 0;
    await fetchData();
});

const changePage = async (event: any) => {
    page.value = Math.floor(event.first / event.rows) + 1;
    first.value = event.first;
    size.value = event.rows;
    await fetchData();
};

const onFirst = async () => {
    page.value = 1;
    first.value = 0;
    await fetchData();
};

const onPrev = async () => {
    if (page.value > 1) {
        page.value--;
        first.value = (page.value - 1) * size.value;
        await fetchData();
    }
};

const onNext = async () => {
    const totalPages = Math.ceil(totalRecords.value / size.value);
    if (page.value < totalPages) {
        page.value++;
        first.value = (page.value - 1) * size.value;
        await fetchData();
    }
};

const onLast = async () => {
    const totalPages = Math.ceil(totalRecords.value / size.value);
    page.value = totalPages;
    first.value = (page.value - 1) * size.value;
    await fetchData();
};

const fetchData = async () => {
    loading.value = true;
    try {
        const response: ProductApiResponse = await ProductService.searchProducts(
            page.value - 1,
            size.value, 
            {
                name: filters.value.global.value
            }
        );
        totalRecords.value = response.totalItems;
        listProduct.value = response.content;
    } catch (error) {
        console.error("Error fetching products:", error);
        listProduct.value = [];
        totalRecords.value = 0;
    } finally {
        loading.value = false;
    }
};

const clearFilter = () => {
    filters.value = {
        global: { value: undefined, matchMode: 'contains' },
    };
    page.value = 1;
    first.value = 0;
};

const deleteSelectedProducts = async () => {
    try {
        const selectedIds = selectedProducts.value.map(product => product.id);
        await ProductService.deleteProducts(selectedIds);
        await fetchData(); // Refresh lại danh sách sau khi xóa
        selectedProducts.value = []; // Reset selection
    } catch (error) {
        console.error("Error deleting products:", error);
    }
};
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <h5>Products List</h5>
                <Toolbar class="mb-4">
                    <template v-slot:start>
                        <div class="my-2">
                            <RouterLink to="/prodductadd">
                                <Button label="New" icon="pi pi-plus" class="p-button-success mr-2" />
                            </RouterLink>
                            <Button label="Delete" 
                                icon="pi pi-trash" 
                                class="p-button-danger" 
                                :disabled="!selectedProducts.length"
                                @click="deleteSelectedProducts" />
                        </div>
                    </template>

                    <template v-slot:end>
                        <FileUpload mode="basic" accept="image/*" :maxFileSize="1000000" label="Import" chooseLabel="Import" class="mr-2 inline-block" />
                        <Button label="Export" icon="pi pi-upload" class="p-button-help" />
                    </template>
                </Toolbar>
                <DataTable
                    v-model:selection="selectedProducts"
                    :value="listProduct"
                    :paginator="true"
                    class="p-datatable-gridlines"
                    :rows="size"
                    :totalRecords="totalRecords"
                    dataKey="id"
                    :rowHover="true"
                    v-model:filters="filters"
                    filterDisplay="menu"
                    :loading="loading"
                    responsiveLayout="scroll"
                    :globalFilterFields="['name', 'description', 'supplierName', 'categoryName']"
                    @page="changePage"
                    :first="first"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
                    :rowsPerPageOptions="[5,10,20,50]"
                    v-model:rows="size"
                >
                    <template #header>
                        <div class="flex justify-content-between flex-column sm:flex-row">
                            <Button type="button" icon="pi pi-filter-slash" label="Clear" class="p-button-outlined mb-2" @click="clearFilter()" />
                            <span class="p-input-icon-left mb-2">
                                <i class="pi pi-search" />
                                <InputText v-model="filters.global.value" placeholder="Keyword Search" style="width: 100%" />
                            </span>
                        </div>
                    </template>

                    <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>

                    <Column field="name" header="Name" sortable style="min-width: 12rem">
                        <template #body="{ data }">
                            {{ console.log(data) }} 
                            {{ data.name }}
                        </template>
                    </Column>

                    <Column field="price" header="Price" sortable style="min-width: 8rem">
                        <template #body="{ data }">
                            {{ data.price }}
                        </template>
                    </Column>

                    <Column field="stockQuantity" header="Stock" sortable style="min-width: 8rem">
                        <template #body="{ data }">
                            {{ data.stockQuantity }}
                        </template>
                    </Column>

                    <Column field="categoryName" header="Category" sortable style="min-width: 10rem">
                        <template #body="{ data }">
                            {{ data.categoryName }}
                        </template>
                    </Column>

                    <Column field="supplierName" header="Supplier" sortable style="min-width: 10rem">
                        <template #body="{ data }">
                            {{ data.supplierName }}
                        </template>
                    </Column>

                    <Column field="sku" header="SKU" sortable style="min-width: 10rem">
                        <template #body="{ data }">
                            {{ data.sku }}
                        </template>
                    </Column>

                    <Column field="imageUrl" header="Image" style="min-width: 10rem">
                        <template #body="{ data }">
                            <img :src="data.imageUrl[0]" alt="Product Image" v-if="data.imageUrl.length > 0" style="width: 50px; height: 50px;" />
                            <span v-else>No Image</span>
                        </template>
                        <template #filter="{ filterModel }">
                            <Dropdown v-model="filterModel.value" :options="statuses" placeholder="Any" class="p-column-filter" :showClear="true">
                                <template #value="slotProps">
                                    <span :class="'customer-badge status-' + slotProps.value" v-if="slotProps.value">{{ slotProps.value }}</span>
                                    <span v-else>{{ slotProps.placeholder }}</span>
                                </template>
                                <template #option="slotProps">
                                    <span :class="'customer-badge status-' + slotProps.option">{{ slotProps.option }}</span>
                                </template>
                            </Dropdown>
                        </template>
                    </Column>
                    <Column field="activity" header="Activity" :showFilterMatchModes="false" style="min-width: 12rem">
                        <template #body="{ data }">
                            <div class="flex align-items-center gap-2">
                                <RouterLink :to="`/productupdate/${data.id}`">
                                    <Button icon="pi pi-pencil" 
                                        class="p-button-rounded p-button-success" 
                                        style="width: 2.5rem; height: 2.5rem;"
                                    />
                                </RouterLink>
                            </div>
                        </template>
                    </Column>
                    <Column field="verified" header="Verified" dataType="boolean" bodyClass="text-center" style="min-width: 8rem">
                        <template #body="{ data }">
                            <i class="pi" :class="{ 'text-green-500 pi-check-circle': data.verified, 'text-pink-500 pi-times-circle': !data.verified }"></i>
                        </template>
                        <template #filter="{ filterModel }">
                            <TriStateCheckbox v-model="filterModel.value" />
                        </template>
                    </Column>
                </DataTable>
                <div class="flex justify-content-center align-items-center gap-3">
                    <Button icon="pi pi-angle-double-left" @click="onFirst" :disabled="page === 1" />
                    <Button icon="pi pi-angle-left" @click="onPrev" :disabled="page === 1" />
                    <span class="p-2 bg-primary-100 border-round">{{ page }}</span>
                    <Button icon="pi pi-angle-right" @click="onNext" :disabled="page >= Math.ceil(totalRecords / size)" />
                    <Button icon="pi pi-angle-double-right" @click="onLast" :disabled="page >= Math.ceil(totalRecords / size)" />
                    <span class="ml-3">Showing {{ (page - 1) * size + 1 }} to {{ Math.min(page * size, totalRecords) }} of {{ totalRecords }}</span>
                    <Dropdown v-model="size" :options="[5, 10, 20, 50]" @change="onFirst" class="ml-3" />
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
::v-deep(.p-datatable-frozen-tbody) {
    font-weight: bold;
}

::v-deep(.p-datatable-scrollable .p-frozen-column) {
    font-weight: bold;
}

.p-button.p-button-icon-only {
    width: 2.5rem;
    padding: 0.5rem 0;
}

.p-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}
</style>
