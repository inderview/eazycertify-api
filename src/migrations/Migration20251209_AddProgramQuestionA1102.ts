import { Migration } from '@mikro-orm/migrations'

export class Migration20251209_AddProgramQuestionA1102 extends Migration {

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
		'<p>Complete the LUIS phrase list update snippet by dragging the correct methods into the slots.</p><pre><code>var phraselistId = await client.Features.[Slot 1](appId, versionId, new [Slot 2]\n{\n    EnabledForAllModels = false,\n    IsExchangeable = true,\n    Name = "PL1",\n    Phrases = "item1,item2,item3,item4,item5"\n});</code></pre>',
		null,
		'C# / LUIS phrase lists',
		'medium',
		'published',
		false,
		null,
		null,
		null,
		'<p>Use <code>AddPhraseListAsync</code> to create a phrase list and instantiate it with <code>PhraselistCreateObject</code>.</p>',
		null,
		now(),
		now()
	) returning id
),
g1 as (
	insert into "question_group" (question_id, label, mode, group_order)
	select id, 'Slot 1 (create phrase list)', 'single', 1 from q
	returning id
),
g2 as (
	insert into "question_group" (question_id, label, mode, group_order)
	select id, 'Slot 2 (object initializer)', 'single', 2 from q
	returning id
)
insert into "question_option" (question_id, group_id, text, is_correct, option_order)
select q.id, g1.id, 'AddPhraseListAsync', true, 1 from q, g1
union all
select q.id, g2.id, 'PhraselistCreateObject', true, 2 from q, g2
union all
select q.id, null, 'Phraselist', false, 3 from q
union all
select q.id, null, 'Phrases', false, 4 from q
union all
select q.id, null, 'SavePhraselistAsync', false, 5 from q
union all
select q.id, null, 'UploadPhraseListAsync', false, 6 from q;
		`)
	}

	override async down (): Promise<void> {
		this.addSql(`
delete from "question_option" where question_id in (
	select id from "question"
	where exam_id = 4
		and type = 'program'
		and text like 'Complete the LUIS phrase list update snippet%'
);
delete from "question_group" where question_id in (
	select id from "question"
	where exam_id = 4
		and type = 'program'
		and text like 'Complete the LUIS phrase list update snippet%'
);
delete from "question" where exam_id = 4 and type = 'program' and text like 'Complete the LUIS phrase list update snippet%';
		`)
	}
}



