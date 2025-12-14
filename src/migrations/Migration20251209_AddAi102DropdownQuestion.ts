import { Migration } from '@mikro-orm/migrations'

export class Migration20251209_AddAi102DropdownQuestion extends Migration {

	override async up (): Promise<void> {
		this.addSql(`
with q as (
	insert into "question" (
		exam_id,
		type,
		text,
		attachments,
		topic,
		difficulty,
		status,
		flagged,
		order_index,
		sort_order,
		block_id,
		explanation,
		reference_url,
		created_at,
		updated_at
	) values (
		4,
		'program',
		'HOTSPOT -\\nYou need to create a new resource that will be used to perform sentiment analysis and optical character recognition (OCR). The solution must meet the following requirements:\\n\\u2022 Use a single key and endpoint to access multiple services.\\n\\u2022 Consolidate billing for future services that you might use.\\n\\u2022 Support the use of Computer Vision in the future.\\nHow should you complete the HTTP request to create the new resource? To answer, select the appropriate options in the answer area.\\nNOTE: Each correct selection is worth one point.\\n\\n[Answer]\\n[Slot 1:select] https://management.azure.com/subscriptions/xxxxxxxx-xxxx-xxxxxxxxxxxx/resourceGroups/RG1/providers/Microsoft.CognitiveServices/accounts/CS1?api-version=2017-04-18\\n{\\n  "location": "West US",\\n  "kind": "[Slot 2:select]",\\n  "sku": {\\n    "name": "S0"\\n  },\\n  "properties": {},\\n  "identity": {\\n    "type": "SystemAssigned"\\n  }\\n}',
		null,
		'AI-102 / Cognitive Services',
		'medium',
		'published',
		false,
		null,
		null,
		null,
		'Use PUT to create the resource and set kind to CognitiveServices for a multi-service account.',
		null,
		now(),
		now()
	) returning id
),
g1 as (
	insert into "question_group" (question_id, label, mode, group_order)
	select id, 'HTTP method', 'single', 1 from q
	returning id
),
g2 as (
	insert into "question_group" (question_id, label, mode, group_order)
	select id, 'Kind', 'single', 2 from q
	returning id
)
insert into "question_option" (question_id, group_id, text, is_correct, option_order)
select q.id, g1.id, 'PATCH', false, 1 from q, g1
union all
select q.id, g1.id, 'POST', false, 2 from q, g1
union all
select q.id, g1.id, 'PUT', true, 3 from q, g1
union all
select q.id, g2.id, 'CognitiveServices', true, 1 from q, g2
union all
select q.id, g2.id, 'ComputerVision', false, 2 from q, g2
union all
select q.id, g2.id, 'TextAnalytics', false, 3 from q, g2;
		`)
	}

	override async down (): Promise<void> {
		this.addSql(`
delete from "question_option" where question_id in (
	select id from "question"
	where exam_id = 4
		and type = 'program'
		and text like '%perform sentiment analysis and optical character recognition%'
);
delete from "question_group" where question_id in (
	select id from "question"
	where exam_id = 4
		and type = 'program'
		and text like '%perform sentiment analysis and optical character recognition%'
);
delete from "question" where exam_id = 4 and type = 'program' and text like '%perform sentiment analysis and optical character recognition%';
		`)
	}
}

