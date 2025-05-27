#!/bin/bash

EFS_ID="fs-08f4ba126f8d806df"
MOUNT_POINT="/mnt/efs"

yum install -y amazon-efs-utils

mkdir -p $MOUNT_POINT

mount -t efs $EFS_ID:/ $MOUNT_POINT
