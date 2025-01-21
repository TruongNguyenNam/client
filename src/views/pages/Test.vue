<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { ProductService } from '../../service/ProductServiceLegacy';
import type { ProductResponse } from '../../model/product';

// Khai báo các biến cần thiết
const listProduct = ref<ProductResponse[]>([]);
const loading = ref(false);
const filters = ref({
    global: { value: null, matchMode: 'contains' },
});

// Fetch data
onMounted(async () => {
    loading.value = true;
    const page = 0;
    const size = 5;
    try {
        const response = await ProductService.getAllProducts(page, size);
        console.log("Dữ liệu từ API:", response);  // Kiểm tra dữ liệu
        listProduct.value = response.content.map(product => ({
            ...product,
            status: product.stockQuantity > 0 ? 'In Stock' : 'Out of Stock' // Adding status based on stock quantity
        }));
    } catch (error) {
        console.error("Error fetching products:", error);
        listProduct.value = [];
    } finally {
        loading.value = false;
    }
});


const clearFilter = () => {
    filters.value = {
        global: { value: null, matchMode: 'contains' },
    };
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
                            <Button label="New" icon="pi pi-plus" class="p-button-success mr-2"/>
                            <Button label="Delete" icon="pi pi-trash" class="p-button-danger"  />
                        </div>
                    </template>

                    <template v-slot:end>
                        <FileUpload mode="basic" accept="image/*" :maxFileSize="1000000" label="Import" chooseLabel="Import" class="mr-2 inline-block" />
                        <Button label="Export" icon="pi pi-upload" class="p-button-help" />
                    </template>
                </Toolbar>
                <DataTable
                    :value="listProduct"
                    :paginator="true"
                    class="p-datatable-gridlines"
                    :rows="10"
                    dataKey="id"
                    :rowHover="true"
                    v-model:filters="filters"
                    filterDisplay="menu"
                    :loading="loading"
                    responsiveLayout="scroll"
                    :globalFilterFields="['name', 'description', 'supplierName', 'categoryName']"
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
                            <span :class="'customer-badge status-' + data.status">{{ data.status }}</span>
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
                            <ProgressBar :value="data.activity" :showValue="false" style="height: 0.5rem"></ProgressBar>
                        </template>
                        <template #filter="{ filterModel }">
                            <Slider v-model="filterModel.value" :range="true" class="m-3"></Slider>
                            <div class="flex align-items-center justify-content-between px-2">
                                <span>{{ filterModel.value ? filterModel.value[0] : 0 }}</span>
                                <span>{{ filterModel.value ? filterModel.value[1] : 100 }}</span>
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
</style>
