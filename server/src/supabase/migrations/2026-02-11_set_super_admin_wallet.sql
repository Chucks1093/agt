-- Promote wallet to SUPER_ADMIN

update public.agents
  set role = 'SUPER_ADMIN'
  where lower(wallet_address) = lower('0x7ddf5e3ee66e28f8a1477697e3c208c9d7795136');
