const FUSE_START_SECONDS = 0.7;
const FUSE_STEP_SECONDS = 0.38;

export const kkInstallFuseIgniteAt = (index: number): number =>
  FUSE_START_SECONDS + index * FUSE_STEP_SECONDS;

export const KK_INSTALL_FUSE_STEP_SECONDS = FUSE_STEP_SECONDS;
