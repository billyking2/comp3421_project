<template>
  <section>
    <div>
      <h1>Members</h1>
      <p>Review customer purchase behavior using paid-order RFM analysis.</p>
    </div>

    <el-row :gutter="16">
      <el-col :xs="12" :sm="6">
        <el-card>
          <el-statistic title="Total members" :value="members.length" />
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card>
          <el-statistic title="Members with purchases" :value="purchasingMembers" />
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card>
          <el-statistic title="Paid revenue" :value="totalRevenue" :precision="2">
            <template #prefix>$</template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card>
          <el-statistic title="Champions" :value="segmentCounts.champion" />
        </el-card>
      </el-col>
    </el-row>

    <el-card>
      <el-form :model="filters" inline @submit.prevent>
        <el-form-item label="Search member">
          <el-input
            v-model="filters.query"
            clearable
            placeholder="Member ID"
            aria-label="Search members by ID"
          />
        </el-form-item>
        <el-form-item label="RFM segment">
          <el-select v-model="filters.segment" aria-label="Filter by RFM segment">
            <el-option label="All segments" value="all" />
            <el-option
              v-for="segment in segmentOptions"
              :key="segment.key"
              :label="`${segment.label} (${segmentCounts[segment.key]})`"
              :value="segment.key"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="Sort by">
          <el-select v-model="filters.sort" aria-label="Sort members">
            <el-option label="RFM segment" value="segment" />
            <el-option label="Most recent purchase" value="recent" />
            <el-option label="Most orders" value="orders" />
            <el-option label="Highest spend" value="monetary" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button @click="resetFilters">Reset</el-button>
        </el-form-item>
      </el-form>

      <el-alert
        v-if="membersStore.error"
        :title="membersStore.error"
        type="error"
        show-icon
        :closable="false"
      />

      <el-table
        v-loading="membersStore.loading"
        :data="pageMembers"
        row-key="user_id"
        empty-text="No members match these filters."
      >
        <el-table-column label="Member ID" min-width="130">
          <template #default="{ row }: { row: RfmMember }">
            {{ row.user_id }}
          </template>
        </el-table-column>
        <el-table-column label="Last paid order" min-width="150">
          <template #default="{ row }: { row: RfmMember }">
            {{ relativeDays(row.days_since_last_order) }}
          </template>
        </el-table-column>
        <el-table-column prop="order_count" label="Orders" width="100" />
        <el-table-column label="Paid spend" min-width="130">
          <template #default="{ row }: { row: RfmMember }">
            ${{ row.monetary.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column label="RFM score" width="130">
          <template #default="{ row }: { row: RfmMember }">
            <el-tag type="info">{{ row.r }} / {{ row.f }} / {{ row.m }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Segment" min-width="160">
          <template #default="{ row }: { row: RfmMember }">
            <el-tag :type="segmentTypes[row.segment]">
              {{ segmentOptions.find(s => s.key === row.segment)?.label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Joined" min-width="130">
          <template #default="{ row }: { row: RfmMember }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="Details" width="100" fixed="right">
          <template #default="{ row }: { row: RfmMember }">
            <el-button type="primary" link @click.stop="openMember(row)">
              View
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="filteredMembers.length"
        layout="total, sizes, prev, pager, next, jumper"
        background
        />

    </el-card>


    <el-drawer
      v-model="detailVisible"
      :title="selectedMember ? selectedMember.user_id : 'Member details'"
      size="40%"
    >
      <template v-if="selectedMember">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="Member ID">
            {{ selectedMember.user_id }}
          </el-descriptions-item>
        
        <el-descriptions-item label="Member Name">
          {{ selectedMember.username }}
            </el-descriptions-item>
          <el-descriptions-item label="Joined">
            {{ formatDate(selectedMember.created_at) }}
          </el-descriptions-item>
          <el-descriptions-item label="Last paid order">
            {{ relativeDays(selectedMember.days_since_last_order) }}
            <template v-if="selectedMember.last_order_at">
              ({{ formatDate(selectedMember.last_order_at) }})
            </template>
          </el-descriptions-item>
          <el-descriptions-item label="Paid orders">
            {{ selectedMember.order_count }}
          </el-descriptions-item>
          <el-descriptions-item label="Paid spend">
            ${{ selectedMember.monetary.toFixed(2) }}
          </el-descriptions-item>
          <el-descriptions-item label="RFM score">
            R ({{ selectedMember.r }}) , F ({{ selectedMember.f }}) , M ({{ selectedMember.m }})
          </el-descriptions-item>
          <el-descriptions-item label="Segment">
            <el-tag :type="segmentTypes[selectedMember.segment]">
              {{ segmentOptions.find(s => s.key === selectedMember?.segment)?.label }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="Suggested action">
            {{ segmentActions[selectedMember.segment] }}
          </el-descriptions-item>
        </el-descriptions>
      </template>
    </el-drawer>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useDashboardDataUsers } from '../../../store/useDashboardDataUsers';
import type { UsersData } from '../../../store/useDashboardDataUsers';

type SegmentKey =
  | 'champion'
  | 'loyal'
  | 'potential'
  | 'needs_attention'
  | 'at_risk'
  | 'hibernating'
  | 'regular'
  | 'dormant';

// RfmMember extends UsersData with additional RFM metrics and segment information
type RfmMember = UsersData & {
  r: number;
  f: number;
  m: number;
  segment: SegmentKey;
};

// map segment
const segmentOptions = [
  { key: 'champion', label: 'Champions' },
  { key: 'loyal', label: 'Loyal' },
  { key: 'potential', label: 'Potential loyalists' },
  { key: 'needs_attention', label: 'Needs attention' },
  { key: 'at_risk', label: 'At risk' },
  { key: 'hibernating', label: 'Hibernating' },
  { key: 'regular', label: 'Regular' },
  { key: 'dormant', label: 'No paid purchases' },
] as const;


// for el colour 
const segmentTypes: Record<
  SegmentKey,
  'success' | 'primary' | 'info' | 'warning' | 'danger'
> = {
  champion: 'success',
  loyal: 'primary',
  potential: 'primary',
  needs_attention: 'warning',
  at_risk: 'danger',
  hibernating: 'info',
  regular: 'info',
  dormant: 'info',
};

// suggestion of segment
const segmentActions: Record<SegmentKey, string> = {
  champion: 'Reward repeat purchases with early access or a loyalty benefit.',
  loyal: 'Encourage another purchase with relevant recommendations.',
  potential: 'Help recent buyers build a repeat-purchase habit.',
  needs_attention: 'Offer useful recommendations before engagement drops.',
  at_risk: 'Consider a targeted win-back offer.',
  hibernating: 'Use a low-pressure reminder or a new-release recommendation.',
  regular: 'Maintain engagement with relevant book recommendations.',
  dormant: 'Introduce the store with a first-purchase offer.',
};

// map segment to number for sort
const segmentPriority = new Map(
  segmentOptions.map(({ key }, index) => [key, index]),
);

const membersStore = useDashboardDataUsers();

const page = ref(1);
const pageSize = ref(20);
const detailVisible = ref(false);
const selectedMember = ref<RfmMember | null>(null);
const filters = reactive({
  query: '',
  segment: 'all' as SegmentKey | 'all',
  sort: 'segment' as 'segment' | 'recent' | 'orders' | 'monetary',
});

onMounted(() => {
  void membersStore.loadUsers();
});

// get memeber in RfmMember format
const members = computed<RfmMember[]>(() => {
  const users = membersStore.users;
  // get all users' recency, frequency, monetary values for scoring
  const recencies = users
    .map((user) => user.days_since_last_order)
    .filter((days): days is number => days !== null);
  const frequencies = users.map((user) => user.order_count);
  const monetaryValues = users.map((user) => user.monetary);

  return users.map((user) => {
    const r = scoreMetric(user.days_since_last_order, recencies, false);
    const f = scoreMetric(user.order_count, frequencies, true);
    const m = scoreMetric(user.monetary, monetaryValues, true);
    const segment = getSegment(r, f, m, user.order_count);

    return { ...user, r, f, m, segment };
  });
});

//counts how many members belong to each RFM segment
const segmentCounts = computed(() => {
  const counts: Record<SegmentKey, number> = {
    champion: 0,
    loyal: 0,
    potential: 0,
    needs_attention: 0,
    at_risk: 0,
    hibernating: 0,
    regular: 0,
    dormant: 0,
  };

  for (const member of members.value) {
    counts[member.segment] += 1;
  }

  return counts;
});

const purchasingMembers = computed(
  () => members.value.filter((member) => member.order_count > 0).length,
);

const totalRevenue = computed(() =>
  members.value.reduce((total, member) => total + member.monetary, 0),
);

const filteredMembers = computed(() => {
  const query = filters.query.trim();
  const filtered = members.value.filter((member) => {
    // id
    const matchesQuery = !query || String(member.user_id).includes(query)
    // segment
    const matchesSegment =
      filters.segment === 'all' || member.segment === filters.segment;

    return matchesQuery && matchesSegment;
  });

  // sort
  return filtered.sort((left, right) => {
    if (filters.sort === 'recent') {
      return (
        (left.days_since_last_order ?? Number.POSITIVE_INFINITY) -
        (right.days_since_last_order ?? Number.POSITIVE_INFINITY)
      );
    }
    if (filters.sort === 'orders') {
      return right.order_count - left.order_count;
    }
    if (filters.sort === 'monetary') {
      return right.monetary - left.monetary;
    }

    // default (segemnt), and if both members are in the same segment, sort by spending
    return (
      (segmentPriority.get(left.segment) ?? 0) -
        (segmentPriority.get(right.segment) ?? 0) ||
      right.monetary - left.monetary
    );
  });
});

// get only the members for the current page
const pageMembers = computed(() => {
  const start = (page.value - 1) * pageSize.value;
  return filteredMembers.value.slice(
    start,
    start + pageSize.value,
  );
});

// reset to page 1 after filtering
watch(
  () => [filters.query, filters.segment, filters.sort],
  () => {
    page.value = 1;
  },
);

// prevent invalid page numbers
watch(
  () => filteredMembers.value.length,
  (count) => {
    const lastPage = Math.max(1,Math.ceil(count / pageSize.value));
    if (page.value > lastPage) page.value = lastPage;
  },
);

// use Min-Max Normalization for RFM, then get the mark in 1-5
function scoreMetric(
  value: number | null,
  population: number[],
  higherIsBetter: boolean,
): number {
  if (value === null) return 1;

  const min = Math.min(...population);
  const max = Math.max(...population);

  if (min === max) return 3;
    
  let score = Math.floor(((value - min) / (max - min)) * (5-1)) + 1;
    // highest mark is 5
  score = Math.min(5, score);

  return higherIsBetter ? score : 6 - score;
}

// group user in which segment
function getSegment(
  r: number,
  f: number,
  m: number,
  orderCount: number,
): SegmentKey {
  if (orderCount === 0) return 'dormant';
  if (r === 5 && f === 5 && m === 5) return 'champion';
  if (r >= 4 && f >= 4 && m >= 4) return 'loyal';
  if (r >= 4 && f <= 3) return 'potential';
  if (r <= 2 && f >= 3) return 'at_risk';
  if (r === 3 && f >= 3) return 'needs_attention';
  if (r <= 2 && f <= 2 && m >= 2) return 'hibernating';
  return 'regular';
}

function relativeDays(days: number | null): string {
  if (days === null) return 'No paid purchases';
  return `${days} days ago`;
}

// form the date
function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString();
}

function openMember(member: RfmMember): void {
  selectedMember.value = member;
  detailVisible.value = true;
}

function resetFilters(): void {
  filters.query = '';
  filters.segment = 'all';
  filters.sort = 'segment';
}
</script>
