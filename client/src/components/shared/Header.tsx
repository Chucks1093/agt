import { Link } from 'react-router';
import { WalletConnectDialog } from '../common/WalletConnectDialog';

function Header() {
	return (
		<div className="border-b border-zinc-200 fixed w-full bg-white/90 backdrop-blur z-50">
			<div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
				<Link
					to="/"
					className="flex items-center gap-3 font-semibold  text-white  border-2 px-4 py-0.5 rounded-lg"
				>
					<span className="text-2xl block  text-gray-500  font-montserrat  font-bold">
						AGT
					</span>
				</Link>

				<div className="hidden md:flex items-center gap-8 text-zinc-600 text-xs absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
					<Link
						className="uppercase tracking-widest hover:text-zinc-900"
						to="/seasons"
					>
						Seasons
					</Link>
					<Link
						className="uppercase tracking-widest hover:text-zinc-900"
						to="/docs"
					>
						Docs
					</Link>
					<a
						className="uppercase tracking-widest hover:text-zinc-900"
						href="https://moltbook.com"
						target="_blank"
						rel="noreferrer"
					>
						Moltbook
					</a>
					<a
						className="uppercase tracking-widest hover:text-zinc-900"
						href="https://x.com"
						target="_blank"
						rel="noreferrer"
					>
						Twitter
					</a>
				</div>

				<div className="flex items-center gap-2">
					<WalletConnectDialog />
				</div>
			</div>
		</div>
	);
}
export default Header;
