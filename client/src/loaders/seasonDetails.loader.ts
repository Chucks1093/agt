import { redirect } from 'react-router';
import { seasonService } from '@/services/season.service';

export async function seasonDetailsLoader({ params }: { params: { id?: string } }) {
	const id = params?.id;
	if (!id) return redirect('/seasons');

	try {
		const season = await seasonService.getById(id);
		if (season.status === 'UPCOMING') return redirect('/seasons');
		return season;
	} catch {
		return redirect('/seasons');
	}
}
